/**
 * POST /api/company/provision - Provision a Twilio phone number
 * 
 * Features:
 * - Request phone number provisioning
 * - Area code selection
 * - Twilio subaccount creation
 * - Number activation
 * - Comprehensive error handling
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import { 
  createErrorResponse, 
  ValidationError, 
  NotFoundError,
  DatabaseError,
  ServiceUnavailableError,
  AuthorizationError,
  TwilioError,
  createRequestContext
} from "@/lib/errors"
import { logger } from "@/lib/logger"

export const dynamic = 'force-dynamic'

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const provisionSchema = z.object({
  areaCode: z.string()
    .length(3, "Area code must be exactly 3 digits")
    .regex(/^\d{3}$/, "Area code must be 3 digits")
    .optional(),
})

export interface ProvisionResponse {
  success: true
  phoneNumber: string
  message: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function createTwilioSubaccount(
  companyName: string
): Promise<{ success: boolean; sid?: string; authToken?: string; error?: string }> {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    
    if (!accountSid || !authToken) {
      return { success: false, error: 'Twilio credentials not configured' }
    }

    // Create subaccount via Twilio API
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Subaccounts.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          FriendlyName: companyName,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      logger.error('Twilio subaccount creation failed:', errorText)
      return { success: false, error: 'Failed to create Twilio subaccount' }
    }

    const data = await response.json()
    return {
      success: true,
      sid: data.sid,
      authToken: data.auth_token,
    }
  } catch (error) {
    logger.error('Exception creating Twilio subaccount:', error)
    return { success: false, error: 'Failed to create Twilio subaccount' }
  }
}

async function provisionPhoneNumber(
  areaCode?: string
): Promise<{ success: boolean; phoneNumber?: string; error?: string }> {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    
    if (!accountSid || !authToken) {
      return { success: false, error: 'Twilio credentials not configured' }
    }

    // Search for available numbers
    const searchParams = new URLSearchParams({
      Type: 'local',
      ...(areaCode && { AreaCode: areaCode }),
      'PageSize': '1',
    })

    const searchResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/AvailablePhoneNumbers/US/Local.json?${searchParams}`,
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        },
      }
    )

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text()
      logger.error('Twilio number search failed:', errorText)
      return { success: false, error: 'No numbers available in this area code' }
    }

    const searchData = await searchResponse.json()
    
    if (!searchData.available_phone_numbers?.length) {
      return { success: false, error: 'No numbers available in this area code' }
    }

    const phoneNumber = searchData.available_phone_numbers[0].phone_number

    // Purchase the number
    const purchaseResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          PhoneNumber: phoneNumber,
          SmsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/sms`,
          StatusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/status`,
        }),
      }
    )

    if (!purchaseResponse.ok) {
      const errorText = await purchaseResponse.text()
      logger.error('Twilio number purchase failed:', errorText)
      return { success: false, error: 'Failed to purchase phone number' }
    }

    return { success: true, phoneNumber }
  } catch (error) {
    logger.error('Exception provisioning phone number:', error)
    return { success: false, error: 'Failed to provision phone number' }
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const context = createRequestContext(request)
  
  try {
    logger.info(`[${context.requestId}] POST /api/company/provision - Starting provisioning`, {
      path: context.path,
      method: context.method,
    })

    const supabase = await createClient()
    
    if (!supabase) {
      throw new ServiceUnavailableError('Database service unavailable')
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new AuthorizationError()
    }

    // Parse request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      throw new ValidationError('Invalid JSON in request body')
    }

    // Validate input
    const parseResult = provisionSchema.safeParse(body)
    if (!parseResult.success) {
      const errors: Record<string, string> = {}
      parseResult.error.errors.forEach((err) => {
        const field = err.path.join('.')
        errors[field] = err.message
      })
      throw new ValidationError('Please fix the validation errors', errors)
    }

    const { areaCode } = parseResult.data
    logger.info(`[${context.requestId}] Provisioning for user ${user.id}`, { areaCode })

    // Get company settings
    const { data: settings, error: settingsError } = await supabase
      .from('company_settings')
      .select('*')
      .eq('admin_id', user.id)
      .single()

    if (settingsError) {
      throw new DatabaseError('Failed to fetch company settings', settingsError)
    }

    // Check if already provisioned
    if (settings.twilio_number) {
      logger.info(`[${context.requestId}] Number already provisioned: ${settings.twilio_number}`)
      const response: ProvisionResponse = {
        success: true,
        phoneNumber: settings.twilio_number,
        message: 'Phone number already provisioned',
      }
      return NextResponse.json(response)
    }

    // Update status to provisioning
    await supabase
      .from('company_settings')
      .update({ number_status: 'provisioning' })
      .eq('admin_id', user.id)

    // Create Twilio subaccount
    const subaccountResult = await createTwilioSubaccount(settings.company_name)
    
    if (!subaccountResult.success) {
      await supabase
        .from('company_settings')
        .update({ number_status: 'failed' })
        .eq('admin_id', user.id)
      
      throw new TwilioError(subaccountResult.error || 'Failed to create subaccount')
    }

    // Provision phone number
    const provisionResult = await provisionPhoneNumber(areaCode)
    
    if (!provisionResult.success) {
      await supabase
        .from('company_settings')
        .update({ number_status: 'failed' })
        .eq('admin_id', user.id)
      
      throw new TwilioError(provisionResult.error || 'Failed to provision number')
    }

    // Update company settings with provisioned number
    const { error: updateError } = await supabase
      .from('company_settings')
      .update({
        twilio_number: provisionResult.phoneNumber,
        twilio_subaccount_sid: subaccountResult.sid,
        twilio_subaccount_status: 'active',
        number_status: 'active',
        number_provisioned_at: new Date().toISOString(),
      })
      .eq('admin_id', user.id)

    if (updateError) {
      logger.error(`[${context.requestId}] Failed to update settings:`, updateError)
      // Number is provisioned but settings not updated - manual cleanup needed
    }

    logger.info(`[${context.requestId}] Provisioning successful: ${provisionResult.phoneNumber}`)

    const response: ProvisionResponse = {
      success: true,
      phoneNumber: provisionResult.phoneNumber!,
      message: 'Phone number provisioned successfully',
    }

    return NextResponse.json(response)

  } catch (error) {
    if (error instanceof ValidationError || 
        error instanceof AuthorizationError ||
        error instanceof DatabaseError ||
        error instanceof TwilioError ||
        error instanceof ServiceUnavailableError) {
      return createErrorResponse(error)
    }
    
    logger.error(`[${context.requestId}] Unexpected error during provisioning:`, error)
    return createErrorResponse(error as Error)
  }
}
