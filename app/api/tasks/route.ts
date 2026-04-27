import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { CreateTaskInput } from '@/types'

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('deadline', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const body: CreateTaskInput = await request.json()

  const { data, error } = await supabase
    .from('tasks')
    .insert([{ ...body, selesai: false }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
