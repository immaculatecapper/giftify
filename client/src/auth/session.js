// The JWT and the signed-in user are kept in localStorage so a refresh keeps you signed in.
const KEY = 'giftify.session'

const safe = (fn, fallback = null) => {
  try {
    return fn()
  } catch {
    return fallback
  }
}

export const saveSession = (token, user) =>
  safe(() => localStorage.setItem(KEY, JSON.stringify({ token, user })))

export const loadSession = () => safe(() => JSON.parse(localStorage.getItem(KEY)) || null)

export const getToken = () => loadSession()?.token || null

export const clearSession = () => safe(() => localStorage.removeItem(KEY))
