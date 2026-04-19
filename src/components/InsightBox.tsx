'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'

const supabase = supabaseBrowser()

type Insight = {
  id: string
  topic: string
  short_text: string
}

export default function InsightBox() {
  const [insight, setInsight] = useState<Insight | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      try {
        const res = await fetch('/api/insights', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        const json = await res.json()
        setInsight(json.insight ?? null)
      } catch {
        // Silently ignore — insight is non-critical
      }
    }
    load()
  }, [])

  if (!insight) return null

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 flex gap-3">
      <span className="text-xl leading-none mt-0.5">🧠</span>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 mb-0.5">
          Did you know · {insight.topic}
        </p>
        <p className="text-sm text-blue-800 leading-relaxed">{insight.short_text}</p>
      </div>
    </div>
  )
}
