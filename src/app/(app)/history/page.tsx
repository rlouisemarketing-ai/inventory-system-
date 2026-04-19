'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import ReflectionEditor from '@/components/ReflectionEditor'

export default function HistoryPage() {
  const supa = useMemo(() => supabaseBrowser(), [])
  const [items, setItems] = useState<any[]>([])
  const [selected, setSelected] = useState<any | null>(null)

  async function token() {
    const { data } = await supa.auth.getSession()
    return data.session?.access_token ?? null
  }

  async function load() {
    const t = await token()
    const res = await fetch('/api/history?limit=100', {
      headers: t ? { Authorization: `Bearer ${t}` } : {},
    })
    const json = await res.json()
    if (json.ok) setItems(json.items)
  }

  async function patch(entryId: string, patchObj: Record<string, unknown>) {
    const t = await token()
    await fetch('/api/history', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
      body: JSON.stringify({ entryId, ...patchObj }),
    })
    await load()
  }

  useEffect(() => { load() }, [])

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 pb-24">
      <h1 className="text-2xl font-serif text-sage-800">History</h1>
      <p className="mt-1 text-sage-500 text-sm">Revisit yesterday, anytime.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Entry list */}
        <div className="space-y-3">
          {items.length === 0 && (
            <p className="text-sage-400 text-sm">No entries yet.</p>
          )}
          {items.map(it => (
            <button
              key={it.id}
              onClick={() => setSelected(it)}
              className={`w-full rounded-xl border bg-white p-4 text-left transition-colors ${
                selected?.id === it.id
                  ? 'border-sage-500 bg-sage-50'
                  : 'border-sage-200 hover:border-sage-400 hover:bg-sage-50'
              }`}
            >
              <div className="text-xs text-sage-400">
                {new Date(it.created_at).toLocaleString()}
              </div>
              <div className="mt-1 font-serif text-sage-800">
                {it.book} {it.chapter}:{it.verse_start}–{it.verse_end}
              </div>
              <div className="mt-1 text-xs text-sage-500">
                {it.detected_route ?? it.selected_emotion}
              </div>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div className="rounded-2xl border border-sage-200 bg-white p-5 shadow-sm">
          {!selected ? (
            <div className="text-sage-400 text-sm">Select an entry to view or edit your reflection.</div>
          ) : (
            <div className="space-y-4">
              <div className="text-lg font-serif text-sage-800">
                {selected.book} {selected.chapter}:{selected.verse_start}–{selected.verse_end}{' '}
                <span className="text-sm font-sans font-normal text-sage-400">({selected.translation})</span>
              </div>

              {(() => {
                const p = selected.scripture_passages
                const text = selected.translation === 'KJV' ? p?.text_kjv
                           : selected.translation === 'ASV' ? p?.text_asv
                           : p?.text_web
                return text ? (
                  <blockquote className="whitespace-pre-wrap border-l-4 border-sage-200 pl-4 text-[16px] leading-7 text-sage-700">
                    {text}
                  </blockquote>
                ) : null
              })()}

              <div>
                <div className="text-sm font-medium text-sage-600 mb-1">Reflection</div>
                <ReflectionEditor
                  initialText={selected.reflection_text ?? ''}
                  onChangeDebounced={t => patch(selected.id, { reflectionText: t })}
                />
              </div>

              <div>
                <div className="text-sm font-medium text-sage-600 mb-1">Prayer</div>
                <ReflectionEditor
                  initialText={selected.prayer_text ?? ''}
                  onChangeDebounced={t => patch(selected.id, { prayerText: t })}
                />
              </div>

              <div className="flex gap-3">
                <button
                  className="rounded-xl border border-sage-300 px-4 py-2 text-sm text-sage-700 hover:bg-sage-50 transition-colors"
                  onClick={() => patch(selected.id, { pinned: !selected.pinned })}
                >
                  {selected.pinned ? 'Unpin' : 'Pin'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </main>
  )
}
