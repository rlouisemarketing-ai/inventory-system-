import { requireUser } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseClient'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/insights — returns one random active insight.
 * Requires authentication.
 */
export async function GET(req: NextRequest) {
  try {
    await requireUser(req.headers.get('authorization')?.replace('Bearer ', '') ?? null)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = supabaseServer()

  // Fetch all active insights, pick one at random server-side
  const { data, error } = await supabase
    .from('insights')
    .select('id, topic, short_text')
    .eq('active', true)

  if (error) {
    console.error('GET /api/insights error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ insight: null })
  }

  const insight = data[Math.floor(Math.random() * data.length)]
  return NextResponse.json({ insight })
}
