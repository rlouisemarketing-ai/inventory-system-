'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseClient'

const supabase = supabaseBrowser()
import {
  formatReference,
  getPassageText,
  type ScripturePassage,
} from '@/lib/rotation'
import { HISTORY_SOURCE_LABELS } from '@/lib/constants'
import type { Translation } from '@/lib/constants'
import { formatDateLong, relativeTime } from '@/lib/date'
import TranslationToggle from '@/components/TranslationToggle'

type HistoryEntry = {
  id: string
  created_at: string
  source: string
  selected_emotion: string | null
  translation: Translation
  reflection_text: string | null
  prayer_text: string | null
  pinned: boolean
  book: string
  chapter: number
  verse_start: number
  verse_end: number
  people_links: { name: string; ref: string }[]
  scripture_passages: ScripturePassage | null
}

export default function ScripturePage() {
  const router = useRouter()
  const params = useSearchParams()
  const entryId = params.get('entry')

  const [entry, setEntry] = useState<HistoryEntry | null>(null)
  const [translation, setTranslation] = useState<Translation>('WEB')
  const [loading, setLoading] = useState(true)
  const [pinned, setPinned] = useState(false)

  useEffect(() => {
    async function load() {
      if (!entryId) { router.replace('/history'); return }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }

      const { data, error } = await supabase
        .from('history_entries')
        .select('*, scripture_passages(*)')
        .eq('id', entryId)
        .eq('user_id', session.user.id)
        .single()

      if (error || !data) { router.replace('/history'); return }

      setEntry(data as HistoryEntry)
      setTranslation(data.translation as Translation)
      setPinned(data.pinned)
      setLoading(false)
    }
    load()
  }, [entryId, router])

  async function togglePin() {
    if (!entry) return
    const next = !pinned
    setPinned(next)
    await supabase
      .from('history_entries')
      .update({ pinned: next })
      .eq('id', entry.id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-sage-400 text-3xl animate-pulse">✦</span>
      </div>
    )
  }

  if (!entry) return null

  const passage = entry.scripture_passages
  const passageText = passage ? getPassageText(passage, translation) : null
  const ref = passage ? formatReference(passage) : `${entry.book} ${entry.chapter}:${entry.verse_start}`

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-warmstone-50 border-b border-warmstone-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700 transition text-lg"
          aria-label="Go back"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 truncate">
            {HISTORY_SOURCE_LABELS[entry.source] ?? entry.source} ·{' '}
            {relativeTime(entry.created_at)}
          </p>
          <p className="font-medium text-gray-800 truncate">{ref}</p>
        </div>
        <button
          onClick={togglePin}
          className={`text-xl transition ${pinned ? 'opacity-100' : 'opacity-30 hover:opacity-60'}`}
          aria-label={pinned ? 'Unpin' : 'Pin'}
        >
          📌
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 px-5 py-6 space-y-6 pb-24 animate-fade-up">
        {/* Reference + translation toggle */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif text-gray-800">{ref}</h2>
          {passage && (
            <TranslationToggle
              value={translation}
              onChange={setTranslation}
            />
          )}
        </div>

        {/* Scripture text */}
        {passageText ? (
          <blockquote className="scripture-body text-gray-800 border-l-4 border-sage-300 pl-4 leading-relaxed">
            {passageText}
          </blockquote>
        ) : (
          <p className="text-gray-400 italic">No text available for this translation.</p>
        )}

        {/* People links */}
        {entry.people_links?.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              People in this passage
            </p>
            <div className="flex flex-wrap gap-2">
              {entry.people_links.map(p => (
                <span
                  key={p.name}
                  className="text-xs bg-warmstone-100 text-warmstone-700 px-3 py-1 rounded-full"
                >
                  {p.name} <span className="text-warmstone-400">· {p.ref}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <hr className="border-warmstone-200" />

        {/* Reflection */}
        {entry.reflection_text && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Your reflection
            </p>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {entry.reflection_text}
            </p>
          </div>
        )}

        {/* Prayer */}
        {entry.prayer_text && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Your prayer
            </p>
            <p className="text-gray-700 leading-relaxed italic whitespace-pre-wrap">
              {entry.prayer_text}
            </p>
          </div>
        )}

        <p className="text-xs text-gray-400">
          {formatDateLong(entry.created_at)}
        </p>
      </div>

    </div>
  )
}
