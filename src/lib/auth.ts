import { supabaseBrowser, supabaseServer } from './supabaseClient'

const supabase = supabaseBrowser()

export type UserProfile = {
  user_id: string
  display_name: string | null
  timezone: string
  preferred_translation: 'WEB' | 'KJV' | 'ASV'
  created_at: string
  updated_at: string
}

export type Schedule = {
  id: string
  user_id: string
  morning_time: string
  midday_time: string
  evening_time: string
}

/** Returns the currently authenticated user, or null. */
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) return null
  return user
}

/** Returns the current session (access_token, etc.), or null. */
export async function getCurrentSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

/** Sends a magic-link sign-in email. */
export async function signInWithMagicLink(email: string) {
  return supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  })
}

/** Signs out the current user. */
export async function signOut() {
  return supabase.auth.signOut()
}

/** Fetches the user's profile row, or null if not found. */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data as UserProfile
}

/**
 * Ensures a profile row exists for the user.
 * Creates one with sensible defaults if absent.
 */
export async function ensureUserProfile(
  userId: string,
  email?: string | null
): Promise<UserProfile> {
  const existing = await getUserProfile(userId)
  if (existing) return existing

  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      user_id: userId,
      display_name: email ? email.split('@')[0] : 'Friend',
    })
    .select()
    .single()

  if (error) throw error
  return data as UserProfile
}

/** Partially updates the user's profile. */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, 'display_name' | 'timezone' | 'preferred_translation'>>
) {
  return supabase
    .from('user_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
}

/** Fetches the user's schedule, or null. */
export async function getSchedule(userId: string): Promise<Schedule | null> {
  const { data } = await supabase
    .from('schedules')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data as Schedule | null
}

/** Upserts the user's schedule. */
export async function upsertSchedule(
  userId: string,
  times: Pick<Schedule, 'morning_time' | 'midday_time' | 'evening_time'>
) {
  const existing = await getSchedule(userId)
  if (existing) {
    return supabase
      .from('schedules')
      .update({ ...times, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
  }
  return supabase.from('schedules').insert({ user_id: userId, ...times })
}

/**
 * Server-side guard: validates a Bearer token and returns the Supabase user.
 * Throws if the token is missing or invalid.
 * Use in API routes: `const user = await requireUser(req.headers.get('authorization')?.replace('Bearer ', '') ?? null)`
 */
export async function requireUser(accessToken: string | null) {
  if (!accessToken) throw new Error('Missing auth token.')
  const supa = supabaseServer()
  const { data, error } = await supa.auth.getUser(accessToken)
  if (error || !data.user) throw new Error('Unauthorized.')
  return data.user
}
