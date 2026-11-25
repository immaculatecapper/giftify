import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api/api.js'
import { clearSession, loadSession, saveSession } from './session.js'

// Global sign-in state: who is signed in, plus signin / signout / refresh helpers.
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadSession()?.user || null)

  const signin = useCallback(async (login, password) => {
    const { token, user: signedIn } = await authApi.signin(login, password)
    saveSession(token, signedIn)
    setUser(signedIn)
    return signedIn
  }, [])

  const signout = useCallback(async () => {
    clearSession()
    setUser(null)
    try {
      await authApi.signout()
    } catch {
      /* the token is already gone locally */
    }
  }, [])

  // Keep the navbar name etc. in sync after the user edits their profile
  const updateUser = useCallback((changes) => {
    setUser((current) => {
      const next = { ...current, ...changes }
      const session = loadSession()
      if (session) saveSession(session.token, next)
      return next
    })
  }, [])

  // apiClient fires this when the server rejects an expired token
  useEffect(() => {
    const onSignedOut = () => setUser(null)
    window.addEventListener('giftify:signedout', onSignedOut)
    return () => window.removeEventListener('giftify:signedout', onSignedOut)
  }, [])

  const value = useMemo(
    () => ({ user, isSignedIn: !!user, isAdmin: user?.role === 'admin', signin, signout, updateUser }),
    [user, signin, signout, updateUser]
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export default AuthContext
