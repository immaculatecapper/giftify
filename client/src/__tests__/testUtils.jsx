import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext.jsx'
import { saveSession, clearSession } from '../auth/session.js'

export const ava = { _id: 'u1', name: 'Ava Chen', username: 'ava', email: 'ava@example.com', role: 'user' }

// Render a component inside the router + auth provider, optionally signed in
export function renderWithProviders(ui, { route = '/', user = null } = {}) {
  clearSession()
  if (user) saveSession('test-token', user)
  return render(
    <MemoryRouter initialEntries={[route]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>
  )
}

// Replace window.fetch with a fake that answers by "METHOD /path"
export function mockFetch(routes) {
  const calls = []
  global.fetch = vi.fn(async (url, opts = {}) => {
    const key = `${opts.method || 'GET'} ${url}`
    calls.push({ key, body: opts.body ? JSON.parse(opts.body) : undefined, headers: opts.headers })
    const handler = routes[key]
    if (!handler) return { ok: false, status: 404, text: async () => JSON.stringify({ error: 'not mocked: ' + key }) }
    const [status, body] = typeof handler === 'function' ? handler(opts) : handler
    return { ok: status < 400, status, text: async () => JSON.stringify(body) }
  })
  return calls
}
