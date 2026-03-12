import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ techId: string }> }
) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { techId } = await params

    // Verify technician owns this account
    const { data: technician, error: techError } = await supabase
      .from('technicians')
      .select('id, auth_user_id')
      .eq('id', techId)
      .single()

    if (techError || !technician || technician.auth_user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get jobs assigned to this technician
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('assigned_tech_id', techId)
      .order('scheduled_time', { ascending: true })

    if (jobsError) {
      console.error('[API] Error fetching jobs:', jobsError)
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      )
    }

    return NextResponse.json({ jobs: jobs || [] })
  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
