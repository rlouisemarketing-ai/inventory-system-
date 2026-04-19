import { supabaseBrowser, supabaseServer } from './supabaseClient'

const supabase = supabaseBrowser()
import type { Translation, TranslationCode } from './constants'

// ── TYPES ──────────────────────────────────────────────────────────
export type PeopleLink = { name: string; ref: string }

export type ScripturePassage = {
  id: string
  emotion_tag: string
  trigger_tags: string[]
  testament: string
  book: string
  chapter: number
  verse_start: number
  verse_end: number
  narrative_id: string | null
  segment_rank: number | null
  book_category: string
  people_links: PeopleLink[]
  text_web: string | null
  text_kjv: string | null
  text_asv: string | null
  active: boolean
  priority: number
}

// ── FETCH BY EMOTION ───────────────────────────────────────────────
/**
 * Fetches the best-matching active passage for a given emotion tag + trigger tags.
 * Excludes recently-shown passage IDs to encourage variety.
 */
export async function fetchPassageForEmotion(
  emotionTag: string,
  triggerTags: string[] = [],
  excludeIds: string[] = []
): Promise<ScripturePassage | null> {
  let query = supabase
    .from('scripture_passages')
    .select('*')
    .eq('active', true)
    .eq('emotion_tag', emotionTag)
    .order('priority', { ascending: false })
    .limit(10)

  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`)
  }

  const { data, error } = await query
  if (error) {
    console.error('fetchPassageForEmotion error:', error)
    return null
  }
  if (!data || data.length === 0) {
    // Fallback: ignore excludeIds
    const { data: fallback } = await supabase
      .from('scripture_passages')
      .select('*')
      .eq('active', true)
      .eq('emotion_tag', emotionTag)
      .order('priority', { ascending: false })
      .limit(5)
    if (!fallback || fallback.length === 0) return null
    return fallback[0] as ScripturePassage
  }

  // Rank by number of matching trigger tags (descending)
  const scored = (data as ScripturePassage[]).map(p => ({
    passage: p,
    score: triggerTags.filter(t => (p.trigger_tags ?? []).includes(t)).length,
  }))
  scored.sort((a, b) => b.score - a.score)

  return scored[0].passage
}

// ── FETCH FOR CONNECT ──────────────────────────────────────────────
/**
 * Fetches a passage appropriate for morning / midday / evening Connect.
 * Different times of day map to different emotional themes.
 */
export async function fetchPassageForConnect(
  timeOfDay: 'morning' | 'midday' | 'evening',
  excludeIds: string[] = []
): Promise<ScripturePassage | null> {
  const themeMap: Record<string, string[]> = {
    morning: ['joy_gratitude', 'peace_contentment', 'anxiety_fear'],
    midday:  ['overwhelm_exhaustion', 'anger_frustration', 'peace_contentment'],
    evening: ['sadness_grief', 'peace_contentment', 'loneliness_isolation'],
  }

  let query = supabase
    .from('scripture_passages')
    .select('*')
    .eq('active', true)
    .in('emotion_tag', themeMap[timeOfDay])
    .order('priority', { ascending: false })
    .limit(15)

  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`)
  }

  const { data, error } = await query
  if (error || !data || data.length === 0) return null

  // Pick randomly from the top 5 to add natural variety
  const pool = data.slice(0, Math.min(5, data.length))
  return pool[Math.floor(Math.random() * pool.length)] as ScripturePassage
}

// ── TEXT HELPERS ───────────────────────────────────────────────────
/** Returns the passage text for the requested translation, falling back to WEB. */
export function getPassageText(passage: ScripturePassage, translation: Translation): string {
  switch (translation) {
    case 'KJV': return passage.text_kjv ?? passage.text_web ?? ''
    case 'ASV': return passage.text_asv ?? passage.text_web ?? ''
    default:    return passage.text_web ?? ''
  }
}

/** Returns true if the passage has text for the requested translation. */
export function hasTranslation(passage: ScripturePassage, translation: Translation): boolean {
  switch (translation) {
    case 'KJV': return !!passage.text_kjv
    case 'ASV': return !!passage.text_asv
    default:    return !!passage.text_web
  }
}

/** Formats "Book Chapter:VerseStart–VerseEnd" (e.g. "Psalms 34:18" or "Romans 8:38–39"). */
export function formatReference(passage: ScripturePassage): string {
  const vs =
    passage.verse_start === passage.verse_end
      ? `${passage.verse_start}`
      : `${passage.verse_start}–${passage.verse_end}`
  return `${passage.book} ${passage.chapter}:${vs}`
}

// ── ROTATED PASSAGE PICKER (server-side) ───────────────────────────
/**
 * Server-side passage picker with personalized recency tracking.
 * Queries the user's history to avoid recently-shown passages, prefers
 * trigger-matching candidates, scores by priority + translation
 * availability, then picks randomly from the top K to add natural variety.
 *
 * Called from API routes — do NOT use on the client.
 */
function getTextByTranslation(p: ScripturePassage, t: TranslationCode): string | null {
  if (t === 'KJV') return p.text_kjv
  if (t === 'ASV') return p.text_asv
  return p.text_web
}

export async function pickRotatedPassage(params: {
  userId: string
  emotionTag: string
  triggers: string[]
  translation: TranslationCode
  recentWindowCount?: number  // last N selections for this emotion
}) {
  const { userId, emotionTag, triggers, translation } = params
  const recentWindowCount = params.recentWindowCount ?? 7
  const supa = supabaseServer()

  // 1) Recent history for this emotion tag
  const { data: recent, error: recentErr } = await supa
    .from('history_entries')
    .select('scripture_passage_id, book, chapter, verse_start, verse_end, created_at, trigger_tags')
    .eq('user_id', userId)
    .eq('selected_emotion', emotionTag)
    .order('created_at', { ascending: false })
    .limit(recentWindowCount)
  if (recentErr) throw recentErr

  const recentIds = new Set(
    (recent ?? []).map(r => r.scripture_passage_id).filter(Boolean)
  )

  // 2) Candidate passages for this emotion
  const { data: candidates, error: candErr } = await supa
    .from('scripture_passages')
    .select('*')
    .eq('active', true)
    .eq('emotion_tag', emotionTag)
  if (candErr) throw candErr

  let pool = (candidates ?? []) as ScripturePassage[]

  // 3) Filter out recently shown
  pool = pool.filter(p => !recentIds.has(p.id))

  // 4) Prefer trigger-matching passages (use full pool if too few)
  const triggerMatches = pool.filter(p =>
    triggers.some(t => (p.trigger_tags ?? []).includes(t))
  )
  if (triggerMatches.length >= 3) pool = triggerMatches

  // 5) If pool is empty, relax recency filter (allow older repetition)
  if (pool.length === 0) {
    pool = (candidates ?? []) as ScripturePassage[]
  }

  // 6) Weighted scoring
  const last = (recent ?? [])[0] as typeof recent extends (infer T)[] ? T : never | undefined
  const scored = pool.map(p => {
    let score = 100 + (p.priority ?? 0)
    // Penalise exact same reference as last selection
    if (last && p.book === last.book && p.chapter === last.chapter &&
        p.verse_start === last.verse_start && p.verse_end === last.verse_end) {
      score -= 50
    }
    // Downrank if chosen translation has no text
    if (!getTextByTranslation(p, translation)) score -= 80
    return { p, score }
  })
  scored.sort((a, b) => b.score - a.score)

  // 7) Pick randomly from top K for natural variety
  const topK = Math.min(5, scored.length)
  if (topK === 0) {
    // Emergency fallback: return any active passage from the DB
    const { data: anyPassage, error: anyErr } = await supa
      .from('scripture_passages')
      .select('*')
      .eq('active', true)
      .order('priority', { ascending: false })
      .limit(1)
      .single()
    if (anyErr || !anyPassage) throw new Error('No scripture passages are available in the database.')
    const p = anyPassage as ScripturePassage
    return {
      passageId:   p.id,
      book:        p.book,
      chapter:     p.chapter,
      verseStart:  p.verse_start,
      verseEnd:    p.verse_end,
      peopleLinks: p.people_links ?? [],
      text:        getTextByTranslation(p, translation) ?? '',
      translation,
    }
  }
  const chosen = scored[Math.floor(Math.random() * topK)].p
  const chosenText = getTextByTranslation(chosen, translation) ?? ''

  return {
    passageId:   chosen.id,
    book:        chosen.book,
    chapter:     chosen.chapter,
    verseStart:  chosen.verse_start,
    verseEnd:    chosen.verse_end,
    peopleLinks: chosen.people_links ?? [],
    text:        chosenText,
    translation,
  }
}
