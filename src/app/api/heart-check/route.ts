import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseClient'
import { mapToEmotionTag, DEFAULT_TRANSLATION } from '@/lib/constants'
import { pickRotatedPassage } from '@/lib/rotation'

/**
 * POST /api/heart-check
 *
 * Accepts the 3-step questionnaire answers { heart, statement, need },
 * routes them to an emotion tag, picks a passage via the rotation algorithm,
 * saves an initial history entry (no reflection yet), and returns the
 * chosen passage + entry so the client can display it immediately.
 *
 * Reflection / prayer text is added later via PATCH /api/history.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    const user = await requireUser(token)

    const body = await req.json()
    const { heart, statement, need } = body

    const supa = supabaseServer()

    // Fetch the user's preferred translation
    const { data: profile } = await supa
      .from('user_profiles')
      .select('preferred_translation')
      .eq('user_id', user.id)
      .maybeSingle()

    const translation = (profile?.preferred_translation ?? DEFAULT_TRANSLATION) as typeof DEFAULT_TRANSLATION

    // Map questionnaire answers → emotion tag + trigger tags
    const route = mapToEmotionTag(heart, statement, need)

    // Pick a passage with recency-aware rotation
    const chosen = await pickRotatedPassage({
      userId:     user.id,
      emotionTag: route.emotionTag,
      triggers:   route.triggers,
      translation,
    })

    // Create the history entry immediately (reflection added later via PATCH)
    const { data: inserted, error: insErr } = await supa
      .from('history_entries')
      .insert({
        user_id:              user.id,
        source:               'heart_check',
        selected_emotion:     route.emotionTag,
        detected_route:       route.routeLabel,
        trigger_tags:         route.triggers,
        translation:          chosen.translation,
        scripture_passage_id: chosen.passageId,
        book:                 chosen.book,
        chapter:              chosen.chapter,
        verse_start:          chosen.verseStart,
        verse_end:            chosen.verseEnd,
        people_links:         chosen.peopleLinks,
        intro_template_id:    'default',
        reflection_prompt_id: 'default',
      })
      .select('*')
      .single()

    if (insErr) throw insErr

    return NextResponse.json({
      ok:      true,
      route:   route.routeLabel,
      entry:   inserted,
      passage: chosen,
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error'
    return NextResponse.json({ ok: false, error: message }, { status: 400 })
  }
}
