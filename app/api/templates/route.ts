import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: templates, error } = await supabase
      .from('templates')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Failed to fetch templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}
