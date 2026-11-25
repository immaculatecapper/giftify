import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { userApi } from '../api/api.js'
import Field from '../components/Field.jsx'
import Alert from '../components/Alert.jsx'
import { validateSignup } from '../utils/validate.js'

// Sign Up = CREATE for the user object. After the account is created we sign the user in.
export default function Signup() {
  const { signin, isSignedIn } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({ name: '', username: '', email: '', password: '', confirm: '', birthday: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [busy, setBusy] = useState(false)

  if (isSignedIn && !busy) return <Navigate to="/" replace />

  const change = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const found = validateSignup(values)
    setErrors(found)
    if (Object.keys(found).length) return
    setBusy(true)
    setServerError('')
    try {
      const { confirm, birthday, ...rest } = values // eslint-disable-line no-unused-vars
      await userApi.signup({ ...rest, ...(birthday ? { birthday } : {}) })
      await signin(values.email, values.password)
      navigate('/lists', { replace: true, state: { welcome: true } })
    } catch (err) {
      setServerError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card wide">
        <div className="auth-head">
          <h1>Create your account</h1>
          <p className="muted">It takes 30 seconds.</p>
        </div>
        {serverError && <Alert>{serverError}</Alert>}
        <form onSubmit={submit} noValidate>
          <div className="grid-2">
            <Field label="Full name" name="name" value={values.name} onChange={change} error={errors.name} autoComplete="name" placeholder="Ava Chen" />
            <Field label="Username" name="username" value={values.username} onChange={change} error={errors.username} autoComplete="username" placeholder="ava" />
          </div>
          <Field label="Email" name="email" type="email" value={values.email} onChange={change} error={errors.email} autoComplete="email" placeholder="ava@example.com" />
          <div className="grid-2">
            <Field label="Password (6+ characters)" name="password" type="password" value={values.password} onChange={change} error={errors.password} autoComplete="new-password" />
            <Field label="Confirm password" name="confirm" type="password" value={values.confirm} onChange={change} error={errors.confirm} autoComplete="new-password" />
          </div>
          <Field label="Birthday (optional)" name="birthday" type="date" value={values.birthday} onChange={change} />
          <p className="privacy-note">🔒 Your account is private — only people you approve can see your lists.</p>
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
