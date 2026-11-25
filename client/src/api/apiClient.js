// Small fetch wrapper used by every API call.
// - adds the JWT as "Authorization: Bearer <token>" when the user is signed in
// - sends/parses JSON
// - turns error responses into thrown Errors with the server's message
import { getToken, clearSession } from '../auth/session.js'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

export async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (auth && token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  let data = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { error: text }
    }
  }

  if (!res.ok) {
    // An expired / invalid token: forget it so the user is sent to Sign In
    if (res.status === 401 && token && auth) {
      clearSession()
      window.dispatchEvent(new Event('giftify:signedout'))
    }
    throw new ApiError((data && (data.error || data.message)) || `Request failed (${res.status})`, res.status)
  }
  return data
}

export const get = (path, opts) => request(path, { ...opts, method: 'GET' })
export const post = (path, body, opts) => request(path, { ...opts, method: 'POST', body })
export const put = (path, body, opts) => request(path, { ...opts, method: 'PUT', body })
export const del = (path, opts) => request(path, { ...opts, method: 'DELETE' })
