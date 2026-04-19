import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseClient'

/** GET /api/history?limit=50 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    const user = await requireUser(token)

    const url = new URL(req.url)
    const limit = Number(url.searchParams.get('limit') ?? '50')

    const supa = supabaseServer()

    const { data, error } = await supa
      .from('history_entries')
      .select('*, scripture_passages(text_web, text_kjv, text_asv)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return NextResponse.json({ ok: true, items: data ?? [] })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error'
    return NextResponse.json({ ok: false, error: message }, { status: 400 })
  }
}

/** PATCH /api/history — save reflection / prayer text, or toggle pinned */
export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    const user = await requireUser(token)

    const body = await req.json()
    const { entryId, reflectionText, prayerText, pinned } = body

    const supa = supabaseServer()

    const patch: Record<string, unknown> = {}
    if (typeof reflectionText === 'string') patch.reflection_text = reflectionText
    if (typeof prayerText     === 'string') patch.prayer_text     = prayerText
    if (typeof pinned         === 'boolean') patch.pinned         = pinned

    const { data, error } = await supa
      .from('history_entries')
      .update(patch)
      .eq('id', entryId)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json({ ok: true, item: data })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error'
    return NextResponse.json({ ok: false, error: message }, { status: 400 })
  }
}
