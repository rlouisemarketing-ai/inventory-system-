'use client'

export default function PassageCard(props: {
  routeLabel: string
  reference: string
  translation: string
  text: string
  peopleLinks: { name: string; ref: string }[]
  onReflect: () => void
  onPray: () => void
}) {
  return (
    <div className="rounded-2xl border border-sage-200 bg-white p-5 shadow-sm">
      <div className="text-xs text-sage-400 uppercase tracking-wide">{props.routeLabel}</div>

      <div className="mt-1 text-xl font-serif text-sage-800">
        {props.reference}{' '}
        <span className="text-sm font-sans font-normal text-sage-400">({props.translation})</span>
      </div>

      <div className="mt-4 whitespace-pre-wrap text-[16px] leading-7 text-sage-700">
        {props.text}
      </div>

      {props.peopleLinks?.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium text-sage-600">
            People in Scripture who experienced moments like this
          </div>
          <ul className="mt-2 list-disc pl-5 text-sage-500 text-sm space-y-1">
            {props.peopleLinks.slice(0, 3).map((p, idx) => (
              <li key={idx}>
                <span className="font-medium text-sage-700">{p.name}</span> — {p.ref}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 flex gap-3">
        <button
          onClick={props.onReflect}
          className="rounded-xl bg-sage-600 px-4 py-2 text-sm text-white hover:bg-sage-700 transition-colors"
        >
          Reflect
        </button>
        <button
          onClick={props.onPray}
          className="rounded-xl border border-sage-300 px-4 py-2 text-sm text-sage-700 hover:bg-sage-50 transition-colors"
        >
          Pray
        </button>
      </div>
    </div>
  )
}
