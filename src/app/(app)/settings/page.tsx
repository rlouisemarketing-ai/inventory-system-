'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import type { TranslationCode } from '@/lib/constants'
import TranslationToggle from '@/components/TranslationToggle'

export default function SettingsPage() {
  const supa = useMemo(() => supabaseBrowser(), [])
  const [translation, setTranslation] = useState<TranslationCode>('WEB')

  async function token() {
    const { data } = await supa.auth.getSession()
    return data.session?.access_token ?? null
  }

  async function load() {
    const t = await token()
    const res = await fetch('/api/settings', {
      headers: t ? { Authorization: `Bearer ${t}` } : {},
    })
    const json = await res.json()
    if (json.ok && json.profile?.preferred_translation) {
      setTranslation(json.profile.preferred_translation)
    }
  }

  async function save(v: TranslationCode) {
    setTranslation(v)
    const t = await token()
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
      body: JSON.stringify({ preferred_translation: v }),
    })
  }

  useEffect(() => { load() }, [])

  return (
    <main className="mx-auto max-w-xl px-4 py-8 pb-24">
      <h1 className="text-2xl font-serif text-sage-800">Settings</h1>
      <p className="mt-1 text-sage-500 text-sm">Scripture translation</p>

      <div className="mt-4 rounded-2xl border border-sage-200 bg-white p-5 shadow-sm">
        <TranslationToggle value={translation} onChange={save} />
        <p className="mt-4 text-xs text-sage-400">
          Scripture is displayed exactly as written in the selected translation.
        </p>
      </div>

    </main>
  )
}
