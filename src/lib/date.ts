export type TimeOfDay = 'morning' | 'midday' | 'evening'

/** Returns the current time-of-day bucket based on local clock hour. */
export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const h = date.getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'midday'
  return 'evening'
}

/** Formats a date as "Monday, January 1, 2025" (with optional IANA timezone). */
export function formatDateLong(iso: string, timezone?: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: timezone,
  })
}

/** Formats a date as "Jan 1, 2025". */
export function formatDateShort(iso: string, timezone?: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: timezone,
  })
}

/** Formats a time as "8:00 AM". */
export function formatTime(iso: string, timezone?: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  })
}

/** Returns a YYYY-MM-DD string for "today" in the given timezone. */
export function todayKey(timezone = 'America/Chicago'): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: timezone }) // en-CA gives YYYY-MM-DD
}

/** Returns a short relative time string: "Just now", "3m ago", "Yesterday", etc. */
export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1)  return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7)  return `${days} days ago`
  return formatDateShort(iso)
}
