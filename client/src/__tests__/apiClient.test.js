import { request } from '../api/apiClient.js'
import { clearSession, loadSession, saveSession } from '../auth/session.js'
import { mockFetch } from './testUtils.jsx'

describe('apiClient', () => {
  beforeEach(() => clearSession())

  it('sends the JWT as a Bearer token', async () => {
    saveSession('abc', { _id: 'u1' })
    const calls = mockFetch({ 'GET /api/wishlists': [200, []] })
    await request('/api/wishlists')
    expect(calls[0].headers.Authorization).toBe('Bearer abc')
  })

  it('throws the API error message with its status', async () => {
    mockFetch({ 'GET /api/wishlists/x': [403, { error: 'This account is private' }] })
    await expect(request('/api/wishlists/x')).rejects.toMatchObject({ message: 'This account is private', status: 403 })
  })

  it('signs the user out when the token is rejected (401)', async () => {
    saveSession('expired', { _id: 'u1' })
    mockFetch({ 'GET /api/claims': [401, { error: 'UnauthorizedError: jwt expired' }] })
    await expect(request('/api/claims')).rejects.toThrow('jwt expired')
    expect(loadSession()).toBeNull()
  })
})
