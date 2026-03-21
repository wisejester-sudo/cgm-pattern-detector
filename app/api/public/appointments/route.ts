import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// POST /api/public/appointments - Create appointment request from customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      phone,
      email,
      address,
      serviceType,
      preferredDate,
      preferredTime,
      notes,
    } = body

    // For now, we'll get the default user (first admin)
    // In production, you'd have a way to route to the right business
    const { data: adminUser } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single()

    if (!adminUser) {
      return NextResponse.json(
        { error: 'No business found' },
        { status: 404 }
      )
    }

    // Create the job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        user_id: adminUser.id,
        customer_name: name,
        customer_phone: phone,
        customer_address: address,
        job_type: serviceType,
        notes: notes || `Preferred time: ${preferredTime}\nEmail: ${email || 'N/A'}\n\n${notes || ''}`,
        scheduled_time: preferredDate
          ? new Date(preferredDate).toISOString()
          : new Date().toISOString(),
        status: 'available', // Available for admin to assign
        assigned_tech_ids: null,
        on_hold_reason: null,
      })
      .select()
      .single()

    if (jobError) {
      console.error('Error creating appointment:', jobError)
      return NextResponse.json(
        { error: 'Failed to create appointment' },
        { status: 500 }
      )
    }

    // Create notification for admin
    await supabase.from('notifications').insert({
      user_id: adminUser.id,
      type: 'job_created',
      title: 'New Appointment Request',
      message: `${name} requested ${serviceType} service`,
      job_id: job.id,
      customer_name: name,
    })

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: 'Appointment request submitted',
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
