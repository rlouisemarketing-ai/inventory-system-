'use client'

import type { TranslationCode } from '@/lib/constants'

const OPTIONS: { code: TranslationCode; label: string }[] = [
  { code: 'WEB', label: 'World English Bible (Default)' },
  { code: 'KJV', label: 'King James Version' },
  { code: 'ASV', label: 'American Standard Version (1901)' },
]

export default function TranslationToggle({
  value,
  onChange,
}: {
  value: TranslationCode
  onChange: (v: TranslationCode) => void
}) {
  return (
    <div className="space-y-2">
      {OPTIONS.map(o => (
        <label key={o.code} className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="translation"
            checked={value === o.code}
            onChange={() => onChange(o.code)}
          />
          <span className="text-sage-700">{o.label}</span>
        </label>
      ))}
    </div>
  )
}
