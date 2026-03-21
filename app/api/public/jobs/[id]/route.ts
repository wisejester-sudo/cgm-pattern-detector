import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// GET /api/public/jobs/[id] - Get job details for customer tracking (no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch job with related data
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select(`
        *,
        assigned_techs:technicians!assigned_tech_ids(id, name, phone)
      `)
      .eq('id', id)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Fetch job photos
    const { data: photos } = await supabase
      .from('photos')
      .select('*')
      .eq('job_id', id)
      .order('uploaded_at', { ascending: false })

    // Fetch company settings
    const { data: settings } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', job.user_id)
      .single()

    return NextResponse.json({
      job,
      photos: photos || [],
      settings: settings || {}
    })

  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
