import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { userApi } from '../api/api.js'
import useAsync from '../hooks/useAsync.js'
import Avatar from '../components/Avatar.jsx'
import Field from '../components/Field.jsx'
import Alert from '../components/Alert.jsx'
import Spinner from '../components/Spinner.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { formatDate, plural, toDateInput } from '../utils/format.js'
import { validateProfile } from '../utils/validate.js'

// My Profile – Read / Update / Delete for the user object (Create is Sign Up).
export default function Profile() {
  const { user, updateUser, signout } = useAuth()
  const navigate = useNavigate()
  const profile = useAsync(() => userApi.read(user._id), [user._id])
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [notice, setNotice] = useState('')

  if (profile.loading) return <Spinner />
  if (profile.error)
    return (
      <div className="container page">
        <Alert>{profile.error}</Alert>
      </div>
    )
  const p = profile.data

  const save = async (values) => {
    const updated = await userApi.update(user._id, values)
    profile.setData((old) => ({ ...old, ...updated }))
    updateUser({ name: updated.name, username: updated.username, email: updated.email, avatarUrl: updated.avatarUrl })
    setEditing(false)
    setNotice('Profile saved.')
  }

  const remove = async () => {
    await userApi.remove(user._id)
    await signout()
    navigate('/', { replace: true })
  }

  return (
    <div className="container page narrow">
      <h1>My Profile</h1>
      <Alert type="success" onClose={() => setNotice('')}>
        {notice}
      </Alert>

      {!editing ? (
        <section className="card profile-card">
          <div className="profile-top">
            <Avatar user={p} size={88} />
            <div>
              <h2>{p.name}</h2>
              <p className="muted">
                @{p.username} · {p.email}
                {p.role === 'admin' && <span className="tag tag-admin">Admin</span>}
              </p>
              <p className="stats">
                <strong>{plural(p.followerCount, 'follower')}</strong> · <strong>{p.followingCount} following</strong>
              </p>
            </div>
          </div>
          {p.bio && <p className="bio">{p.bio}</p>}
          <dl className="details">
            <dt>Birthday</dt>
            <dd>{p.birthday ? formatDate(p.birthday) : '—'}</dd>
            <dt>Member since</dt>
            <dd>{formatDate(p.created)}</dd>
          </dl>
          <div className="form-actions start">
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              Edit profile
            </button>
            <button className="btn btn-ghost danger" onClick={() => setDeleting(true)}>
              Delete account
            </button>
          </div>
        </section>
      ) : (
        <section className="card">
          <ProfileForm initial={p} onSubmit={save} onCancel={() => setEditing(false)} />
        </section>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete your account?"
          message="Your profile, wish lists, items and follows will be permanently deleted. Gifts you claimed for others are released. This can't be undone."
          confirmLabel="Delete my account"
          onConfirm={remove}
          onClose={() => setDeleting(false)}
        />
      )}
    </div>
  )
}

export function ProfileForm({ initial, onSubmit, onCancel }) {
  const [values, setValues] = useState({
    name: initial.name || '',
    username: initial.username || '',
    email: initial.email || '',
    bio: initial.bio || '',
    avatarUrl: initial.avatarUrl || '',
    birthday: toDateInput(initial.birthday),
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [busy, setBusy] = useState(false)
  const change = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const found = validateProfile(values)
    if (values.avatarUrl && !/^https?:\/\//i.test(values.avatarUrl)) found.avatarUrl = 'Must start with http:// or https://'
    setErrors(found)
    if (Object.keys(found).length) return
    setBusy(true)
    setServerError('')
    const { password, birthday, ...rest } = values
    try {
      await onSubmit({ ...rest, birthday: birthday || null, ...(password ? { password } : {}) })
    } catch (err) {
      setServerError(err.message)
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <h2>Edit profile</h2>
      {serverError && <Alert>{serverError}</Alert>}
      <div className="grid-2">
        <Field label="Full name" name="name" value={values.name} onChange={change} error={errors.name} />
        <Field label="Username" name="username" value={values.username} onChange={change} error={errors.username} />
      </div>
      <Field label="Email" name="email" type="email" value={values.email} onChange={change} error={errors.email} />
      <Field label="Bio" name="bio" as="textarea" rows={3} value={values.bio} onChange={change} error={errors.bio} maxLength={280} hint={`${values.bio.length}/280`} />
      <div className="grid-2">
        <Field label="Profile photo link" name="avatarUrl" type="url" value={values.avatarUrl} onChange={change} error={errors.avatarUrl} placeholder="https://…" />
        <Field label="Birthday" name="birthday" type="date" value={values.birthday} onChange={change} />
      </div>
      <Field label="New password" name="password" type="password" value={values.password} onChange={change} error={errors.password} autoComplete="new-password" hint="Leave blank to keep your current password" />
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Saving…' : 'Save profile'}
        </button>
      </div>
    </form>
  )
}
