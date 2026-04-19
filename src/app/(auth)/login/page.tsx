'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithMagicLink } from '@/lib/auth'
import { supabaseBrowser } from '@/lib/supabaseClient'

const supabase = supabaseBrowser()

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if already authenticated
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/connect')
    })
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signInWithMagicLink(email.trim())
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center animate-fade-up">
        <div className="text-6xl mb-6">✉️</div>
        <h1 className="text-2xl font-serif text-gray-800 mb-3">Check your email</h1>
        <p className="text-gray-500 leading-relaxed max-w-xs">
          We sent a sign-in link to{' '}
          <span className="font-medium text-gray-700">{email}</span>. Click it to
          continue — no password needed.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-8 text-sm text-sage-600 underline underline-offset-2"
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="w-full max-w-sm animate-fade-up">
        {/* Branding */}
        <div className="text-center mb-10">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 mx-auto mb-5 drop-shadow-md">
            <defs>
              <linearGradient id="heartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8ea076" />
                <stop offset="100%" stopColor="#445037" />
              </linearGradient>
            </defs>
            <path
              d="M 50,85 C 10,65 5,45 5,32 C 5,18 15,8 28,8 C 36,8 44,13 50,20 C 56,13 64,8 72,8 C 85,8 95,18 95,32 C 95,45 90,65 50,85 Z"
              fill="url(#heartGrad)"
            />
            <rect x="44" y="27" width="12" height="40" rx="3" fill="white" opacity="0.92" />
            <rect x="29" y="40" width="42" height="12" rx="3" fill="white" opacity="0.92" />
          </svg>
          <h1 className="text-3xl font-serif text-sage-700 mb-2">Growing in Grace</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            A gentle daily practice for your emotional &amp; spiritual well-being.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white text-gray-900 placeholder-gray-400 transition"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full py-3 px-6 bg-sage-600 hover:bg-sage-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending link…' : 'Send sign-in link'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
          No password needed. We&apos;ll email you a secure, one-time sign-in link.
        </p>
      </div>
    </div>
  )
}
