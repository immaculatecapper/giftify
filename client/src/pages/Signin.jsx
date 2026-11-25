import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import Field from '../components/Field.jsx'
import Alert from '../components/Alert.jsx'
import { LogoMark } from '../components/Logo.jsx'

export default function Signin() {
  const { signin, isSignedIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState({ login: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const message = location.state?.message

  if (isSignedIn && !busy) return <Navigate to="/" replace />

  const change = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!values.login.trim() || !values.password) {
      setError('Enter your email (or username) and password.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await signin(values.login.trim(), values.password)
      navigate(location.state?.from || '/', { replace: true })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-head">
          <LogoMark size={48} />
          <h1>Welcome back</h1>
          <p className="muted">Sign in to see your lists and your friends'.</p>
        </div>
        {message && <Alert type="success">{message}</Alert>}
        {error && <Alert>{error}</Alert>}
        <form onSubmit={submit} noValidate>
          <Field label="Email or username" name="login" value={values.login} onChange={change} autoComplete="username" placeholder="ava@example.com" />
          <Field label="Password" name="password" type="password" value={values.password} onChange={change} autoComplete="current-password" placeholder="••••••••" />
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="auth-switch">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  )
}
