// Display helpers shared by the pages

export const OCCASIONS = [
  { value: 'birthday', label: 'Birthday', emoji: '🎂' },
  { value: 'christmas', label: 'Christmas', emoji: '🎄' },
  { value: 'wedding', label: 'Wedding', emoji: '💍' },
  { value: 'baby_shower', label: 'Baby shower', emoji: '🍼' },
  { value: 'graduation', label: 'Graduation', emoji: '🎓' },
  { value: 'anniversary', label: 'Anniversary', emoji: '💕' },
  { value: 'housewarming', label: 'Housewarming', emoji: '🏡' },
  { value: 'other', label: 'Other', emoji: '🎁' },
]

export const occasionOf = (value) => OCCASIONS.find((o) => o.value === value) || OCCASIONS[OCCASIONS.length - 1]

// Dates are stored as midnight UTC, so format them in UTC to avoid "off by one day"
export const formatDate = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
}

// For <input type="date">
export const toDateInput = (value) => {
  if (!value) return ''
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
}

export const formatPrice = (value) =>
  value === undefined || value === null || value === ''
    ? ''
    : new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(Number(value))

// Whole days from today until the date (negative if it has passed)
export const daysUntil = (value, now = new Date()) => {
  if (!value) return null
  const d = new Date(value)
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - today) / 86400000)
}

export const countdown = (value, now) => {
  const n = daysUntil(value, now)
  if (n === null) return ''
  if (n === 0) return 'Today!'
  if (n === 1) return 'Tomorrow'
  if (n > 1) return `In ${n} days`
  return 'Passed'
}

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '?'

export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

// Only allow http(s) links in hrefs / img src
export const safeUrl = (value) => (value && /^https?:\/\//i.test(value) ? value : '')
