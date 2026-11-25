import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { userApi } from '../api/api.js'
import useAsync from '../hooks/useAsync.js'
import Avatar from '../components/Avatar.jsx'
import Spinner from '../components/Spinner.jsx'
import Alert from '../components/Alert.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { ProfileForm } from './Profile.jsx'
import { formatDate } from '../utils/format.js'

// Admin only: read, update and delete any user account (moderation).
export default function AdminUsers() {
  const { user: me } = useAuth()
  const [q, setQ] = useState('')
  const { data, setData, loading, error } = useAsync(() => userApi.search(''), [])
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [notice, setNotice] = useState('')

  const shown = (data || []).filter((u) => `${u.name} ${u.username} ${u.email}`.toLowerCase().includes(q.toLowerCase()))

  const save = async (values) => {
    const updated = await userApi.update(editing._id, values)
    setData((a) => a.map((u) => (u._id === updated._id ? updated : u)))
    setEditing(null)
    setNotice(`Updated ${updated.name}.`)
  }
  const remove = async () => {
    await userApi.remove(deleting._id)
    setData((a) => a.filter((u) => u._id !== deleting._id))
    setNotice(`Deleted ${deleting.name} and their data.`)
  }

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Users</h1>
          <p className="muted">Admin: manage every account.</p>
        </div>
        <input className="search-input sm" type="search" placeholder="Filter users" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter users" />
      </div>
      <Alert type="success" onClose={() => setNotice('')}>
        {notice}
      </Alert>
      {loading ? (
        <Spinner />
      ) : error ? (
        <Alert>{error}</Alert>
      ) : (
        <div className="table-wrap card">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map((u) => (
                <tr key={u._id}>
                  <td>
                    <span className="owner-line">
                      <Avatar user={u} size={28} />
                      <Link to={`/users/${u._id}`}>{u.name}</Link> <span className="muted small">@{u.username}</span>
                    </span>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={'tag' + (u.role === 'admin' ? ' tag-admin' : '')}>{u.role}</span>
                  </td>
                  <td>{formatDate(u.created)}</td>
                  <td className="row-actions">
                    <button className="btn btn-sm btn-ghost" onClick={() => setEditing(u)}>
                      Edit
                    </button>
                    {u._id !== me._id && (
                      <button className="btn btn-sm btn-ghost danger" onClick={() => setDeleting(u)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && (
        <Modal title={`Edit ${editing.name}`} onClose={() => setEditing(null)}>
          <ProfileForm initial={editing} onSubmit={save} onCancel={() => setEditing(null)} />
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog
          title={`Delete ${deleting.name}?`}
          message="Their account, wish lists, items and follows will be permanently deleted."
          onConfirm={remove}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  )
}
