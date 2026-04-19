'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/connect',     label: 'Connect' },
  { href: '/heart-check', label: 'Heart Check' },
  { href: '/history',     label: 'History' },
  { href: '/settings',    label: 'Settings' },
]

export default function NavBar() {
  const path = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-sage-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl justify-around px-4 py-3">
        {items.map(i => {
          const active = path?.startsWith(i.href)
          return (
            <Link
              key={i.href}
              href={i.href}
              className={`text-sm transition-colors ${active ? 'font-semibold text-sage-700' : 'text-sage-400 hover:text-sage-600'}`}
            >
              {i.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
