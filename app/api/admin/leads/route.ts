import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

async function checkAdminRole(supabase: SupabaseClient, userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  return profile?.role === 'admin'
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const isAdmin = await checkAdminRole(supabase, user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse query parameters
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const search = url.searchParams.get('search') || ''
    const status = url.searchParams.get('status') || ''
    const tierInterest = url.searchParams.get('tier_interest') || ''
    const source = url.searchParams.get('source') || ''
    
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('leads')
      .select('*')

    // Apply filters
    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%,company.ilike.%${search}%`)
    }
    
    if (status) {
      query = query.eq('status', status)
    }
    
    if (tierInterest) {
      query = query.eq('tier_interest', tierInterest)
    }
    
    if (source) {
      query = query.eq('source', source)
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })

    // Get paginated results
    const { data: leads, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching leads:', error)
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const isAdmin = await checkAdminRole(supabase, user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { leadId, action, value, notes } = body

    if (!leadId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get current lead data for audit log
    const { data: currentLead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (!currentLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    let oldValue = ''
    let newValue = ''

    switch (action) {
      case 'update_status':
        oldValue = currentLead.status
        newValue = value
        updateData.status = value
        if (value === 'contacted') {
          updateData.last_contacted_at = new Date().toISOString()
        }
        if (value === 'converted') {
          updateData.conversion_date = new Date().toISOString()
        }
        break
        
      case 'update_score':
        oldValue = currentLead.lead_score?.toString() || '0'
        newValue = value.toString()
        updateData.lead_score = value
        break
        
      case 'assign_to':
        oldValue = currentLead.assigned_to || 'unassigned'
        newValue = value || 'unassigned'
        updateData.assigned_to = value
        break
        
      case 'add_notes':
        oldValue = currentLead.notes || ''
        newValue = notes || ''
        updateData.notes = notes
        break
        
      case 'set_follow_up':
        oldValue = currentLead.follow_up_date || ''
        newValue = value
        updateData.follow_up_date = value
        break
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Update lead
    const { error: updateError } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', leadId)

    if (updateError) {
      console.error('Error updating lead:', updateError)
      return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
    }

    // Log admin action
    const { error: logError } = await supabase
      .from('admin_actions')
      .insert({
        admin_id: user.id,
        action_type: action,
        target_id: leadId,
        target_type: 'lead',
        old_value: oldValue,
        new_value: newValue,
        description: `Admin ${action} for lead ${currentLead.email}`,
        metadata: { 
          lead_email: currentLead.email,
          lead_name: currentLead.name 
        }
      })

    if (logError) {
      console.error('Error logging admin action:', logError)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
