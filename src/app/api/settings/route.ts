import { requireUser } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseClient'
import { NextRequest, NextResponse } from 'next/server'

function extractToken(req: NextRequest) {
  const h = req.headers.get('authorization')
  return h?.startsWith('Bearer ') ? h.slice(7) : null
}

/** GET /api/settings — returns profile + schedule */
export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(extractToken(req))
    const supa = supabaseServer()

    const [profileRes, scheduleRes] = await Promise.all([
      supa.from('user_profiles').select('*').eq('user_id', user.id).single(),
      supa.from('schedules').select('*').eq('user_id', user.id).single(),
    ])

    return NextResponse.json({
      ok:       true,
      profile:  profileRes.data  ?? null,
      schedule: scheduleRes.data ?? null,
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error'
    return NextResponse.json({ ok: false, error: message }, { status: 400 })
  }
}

/** PATCH /api/settings — partial profile update (snake_case fields) */
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser(extractToken(req))
    const body = await req.json()
    const supa = supabaseServer()
    const now  = new Date().toISOString()

    const updates: Record<string, unknown> = { user_id: user.id, updated_at: now }
    if (body.preferred_translation !== undefined) updates.preferred_translation = body.preferred_translation
    if (body.display_name          !== undefined) updates.display_name          = body.display_name
    if (body.timezone              !== undefined) updates.timezone              = body.timezone

    const { error } = await supa
      .from('user_profiles')
      .upsert(updates, { onConflict: 'user_id' })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error'
    return NextResponse.json({ ok: false, error: message }, { status: 400 })
  }
}

/** PUT /api/settings — upsert full profile + schedule (camelCase fields) */
export async function PUT(req: NextRequest) {
  try {
    const user = await requireUser(extractToken(req))
    const body = await req.json()
    const { displayName, timezone, preferredTranslation, morningTime, middayTime, eveningTime } = body
    const supa = supabaseServer()
    const now  = new Date().toISOString()

    // Upsert profile
    const profileUpdates: Record<string, unknown> = { user_id: user.id, updated_at: now }
    if (displayName          !== undefined) profileUpdates.display_name           = displayName
    if (timezone             !== undefined) profileUpdates.timezone               = timezone
    if (preferredTranslation !== undefined) profileUpdates.preferred_translation  = preferredTranslation

    const { error: profileError } = await supa
      .from('user_profiles')
      .upsert(profileUpdates, { onConflict: 'user_id' })

    if (profileError) throw profileError

    // Upsert schedule
    if (morningTime || middayTime || eveningTime) {
      const { data: existing } = await supa
        .from('schedules').select('id').eq('user_id', user.id).single()

      if (existing) {
        await supa.from('schedules').update({
          morning_time: morningTime ?? undefined,
          midday_time:  middayTime  ?? undefined,
          evening_time: eveningTime ?? undefined,
          updated_at:   now,
        }).eq('user_id', user.id)
      } else {
        await supa.from('schedules').insert({
          user_id:      user.id,
          morning_time: morningTime ?? '08:00',
          midday_time:  middayTime  ?? '13:00',
          evening_time: eveningTime ?? '20:00',
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error'
    return NextResponse.json({ ok: false, error: message }, { status: 400 })
  }
}
