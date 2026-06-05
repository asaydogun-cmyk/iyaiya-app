import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await adminClient()
      .from('children')
      .select('*')
      .eq('id', id)
      .single()
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await request.json()
    const { error } = await adminClient()
      .from('children')
      .update(payload)
      .eq('id', id)
    if (error) {
      console.error('Supabase update error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('children PUT error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { phrase } = await request.json() as { phrase: string }

    const { data, error: fetchError } = await adminClient()
      .from('children')
      .select('effective_phrases')
      .eq('id', id)
      .single()
    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })

    const existing: string = data?.effective_phrases || ''
    const lines = existing.split('\n').map((s: string) => s.trim()).filter(Boolean)
    if (!lines.includes(phrase.trim())) {
      lines.push(phrase.trim())
      const { error } = await adminClient()
        .from('children')
        .update({ effective_phrases: lines.join('\n') })
        .eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('children PATCH error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await adminClient()
      .from('children')
      .delete()
      .eq('id', id)
    if (error) {
      console.error('Supabase delete error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('children DELETE error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
