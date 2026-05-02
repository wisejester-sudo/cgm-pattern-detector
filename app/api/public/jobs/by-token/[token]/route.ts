import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function createServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// GET /api/public/jobs/by-token/[token] - Get job by customer access token
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const supabase = createServiceClient()
    const { token } = await params

    if (!token) {
      return NextResponse.json(
        { error: 'Token required' },
        { status: 400 }
      )
    }

    // Look up the token
    const { data: accessToken, error: tokenError } = await supabase
      .from('customer_access_tokens')
      .select('job_id, expires_at')
      .eq('token', token)
      .single()

    if (tokenError || !accessToken) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 404 }
      )
    }

    // Check if expired
    const expiresAt = new Date(accessToken.expires_at)
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 410 }
      )
    }

    // Fetch job (without sensitive fields like notes)
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select(`
        id,
        customer_name,
        customer_phone,
        customer_address,
        job_type,
        status,
        scheduled_time,
        assigned_tech_ids
      `)
      .eq('id', accessToken.job_id)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Fetch assigned technicians
    let technicians: Array<{ id: string; name: string; phone: string }> = []
    if (job.assigned_tech_ids && job.assigned_tech_ids.length > 0) {
      const { data: techs } = await supabase
        .from('technicians')
        .select('id, name, phone')
        .in('id', job.assigned_tech_ids)
      
      technicians = techs || []
    }

    // Fetch photos
    const { data: photos } = await supabase
      .from('photos')
      .select('id, photo_url, caption, uploaded_at')
      .eq('job_id', accessToken.job_id)
      .order('uploaded_at', { ascending: false })

    // Fetch company settings
    const { data: settings } = await supabase
      .from('settings')
      .select('company_name, company_phone')
      .eq('user_id', (await supabase.from('jobs').select('user_id').eq('id', accessToken.job_id).single()).data?.user_id)
      .single()

    return NextResponse.json({
      job,
      technicians,
      photos: photos || [],
      settings: settings || { company_name: '', company_phone: '' }
    })

  } catch (error) {
    console.error('Error fetching job by token:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
