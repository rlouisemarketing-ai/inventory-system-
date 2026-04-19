'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseClient'

const supabase = supabaseBrowser()

/**
 * Root page: checks auth and redirects immediately.
 * Shows a minimal loading indicator while the session is resolving.
 */
export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/connect')
      } else {
        router.replace('/login')
      }
    })
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <span className="text-sage-400 text-3xl animate-pulse select-none">✦</span>
    </div>
  )
}
