'use client'

import { useEffect, useState } from 'react'

interface ReflectionEditorProps {
  initialText?: string | null
  onChangeDebounced?: (text: string) => void
}

export default function ReflectionEditor({
  initialText,
  onChangeDebounced,
}: ReflectionEditorProps) {
  const [text, setText] = useState(initialText ?? '')

  // Sync if parent provides updated initialText (e.g. loading an existing entry)
  useEffect(() => {
    setText(initialText ?? '')
  }, [initialText])

  // Fire the debounced callback 800 ms after the user stops typing
  useEffect(() => {
    if (!onChangeDebounced) return
    const t = setTimeout(() => onChangeDebounced(text), 800)
    return () => clearTimeout(t)
  }, [text, onChangeDebounced])

  return (
    <div className="w-full">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Write anything that comes to mind. Even one sentence is enough."
        rows={5}
        className="w-full rounded-xl border border-sage-200 p-4 text-[16px] leading-7 outline-none focus:ring-2 focus:ring-sage-300 bg-white text-sage-800 placeholder-sage-300 resize-none transition"
        style={{ minHeight: 140 }}
      />
      <p className="mt-2 text-xs text-sage-400">Saved automatically.</p>
    </div>
  )
}
