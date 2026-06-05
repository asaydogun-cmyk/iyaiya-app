import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userKey = searchParams.get('userKey')
    const childId = searchParams.get('childId')

    if (!userKey) return NextResponse.json({ error: 'userKey required' }, { status: 400 })

    let query = adminClient()
      .from('records')
      .select('*')
      .eq('user_key', userKey)
      .order('created_at', { ascending: false })

    if (childId) query = query.eq('child_id', childId)

    const { data, error } = await query
    if (error) {
      console.error('records GET error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (e) {
    console.error('records GET error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data, error } = await adminClient()
      .from('records')
      .insert(body)
      .select()
      .single()
    if (error) {
      console.error('records POST error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (e) {
    console.error('records POST error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
