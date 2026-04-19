'use client'

import { HISTORY_SOURCE_LABELS, EMOTION_GROUPS } from '@/lib/constants'
import { relativeTime } from '@/lib/date'

// Emoji for new 3-step routing tags (fallback when not in EMOTION_GROUPS)
const EXTRA_EMOTION_EMOJI: Record<string, string> = {
  anxiety_worry:      '😰',
  overwhelm_burnout:  '😩',
  loneliness_unseen:  '🫂',
  waiting_uncertainty:'⏳',
  general:            '📖',
}

type HistoryEntry = {
  id: string
  created_at: string
  source: string
  selected_emotion: string | null
  book: string
  chapter: number
  verse_start: number
  verse_end: number
  reflection_text: string | null
  pinned: boolean
}

interface HistoryListProps {
  entries: HistoryEntry[]
  onSelect: (id: string) => void
}

function formatRef(e: HistoryEntry) {
  const vs =
    e.verse_start === e.verse_end
      ? `${e.verse_start}`
      : `${e.verse_start}–${e.verse_end}`
  return `${e.book} ${e.chapter}:${vs}`
}

function emotionEmoji(tag: string | null): string {
  if (!tag) return '📖'
  return (
    EMOTION_GROUPS.find(g => g.value === tag)?.emoji ??
    EXTRA_EMOTION_EMOJI[tag] ??
    '📖'
  )
}

export default function HistoryList({ entries, onSelect }: HistoryListProps) {
  if (entries.length === 0) return null

  return (
    <ul className="divide-y divide-warmstone-100">
      {entries.map(entry => (
        <li key={entry.id}>
          <button
            onClick={() => onSelect(entry.id)}
            className="w-full text-left px-5 py-4 hover:bg-warmstone-50 transition-colors flex items-start gap-3"
          >
            {/* Emotion emoji */}
            <span className="text-2xl leading-none mt-0.5 flex-shrink-0">
              {emotionEmoji(entry.selected_emotion)}
            </span>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs text-gray-400 font-medium">
                  {HISTORY_SOURCE_LABELS[entry.source] ?? entry.source}
                </span>
                {entry.pinned && (
                  <span className="text-[10px] text-sage-600 font-semibold bg-sage-50 px-2 py-0.5 rounded-full">
                    📌 Pinned
                  </span>
                )}
              </div>

              <p className="font-serif text-gray-800 font-medium text-sm">
                {formatRef(entry)}
              </p>

              {entry.reflection_text && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                  {entry.reflection_text}
                </p>
              )}
            </div>

            {/* Time */}
            <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">
              {relativeTime(entry.created_at)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
