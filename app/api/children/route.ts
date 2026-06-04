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
    const userKey = request.nextUrl.searchParams.get('userKey')
    if (!userKey) {
      return NextResponse.json({ error: 'userKey is required' }, { status: 400 })
    }
    const { data, error } = await adminClient()
      .from('children')
      .select('*')
      .eq('user_key', userKey)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Supabase select error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (e) {
    console.error('children GET error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const { data, error } = await adminClient()
      .from('children')
      .insert(payload)
      .select()
      .single()
    if (error) {
      console.error('Supabase insert error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    console.log('[API] insert success, id:', data?.id, 'user_key:', data?.user_key)
    return NextResponse.json(data)
  } catch (e) {
    console.error('children POST error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
