import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { wishlistApi } from '../api/api.js'
import useAsync from '../hooks/useAsync.js'
import WishlistCard from '../components/WishlistCard.jsx'
import WishlistForm from '../components/WishlistForm.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Spinner from '../components/Spinner.jsx'
import Alert from '../components/Alert.jsx'

// My Wish Lists – full CRUD for the wishlist object
// Create: POST /api/wishlists · Read: GET /api/wishlists · Update: PUT · Delete: DELETE
export default function MyLists() {
  const { data: lists, setData, loading, error } = useAsync(() => wishlistApi.mine(), [])
  const [editing, setEditing] = useState(null) // null | {} (new) | list
  const [deleting, setDeleting] = useState(null)
  const [notice, setNotice] = useState('')
  const location = useLocation()

  const save = async (values) => {
    if (editing._id) {
      const updated = await wishlistApi.update(editing._id, values)
      setData((all) => all.map((l) => (l._id === updated._id ? { ...l, ...updated } : l)))
      setNotice(`Saved “${updated.title}”.`)
    } else {
      const created = await wishlistApi.create(values)
      setData((all) => [{ ...created, itemCount: 0 }, ...all])
      setNotice(`Created “${created.title}”. Open it to add items.`)
    }
    setEditing(null)
  }

  const remove = async () => {
    await wishlistApi.remove(deleting._id)
    setData((all) => all.filter((l) => l._id !== deleting._id))
    setNotice(`Deleted “${deleting.title}”.`)
  }

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>My Wish Lists</h1>
          <p className="muted">Only followers you approve can see these.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({})}>
          + New Wish List
        </button>
      </div>

      {location.state?.welcome && !notice && <Alert type="success">Welcome to Giftify! Start by creating your first wish list.</Alert>}
      <Alert type="success" onClose={() => setNotice('')}>
        {notice}
      </Alert>

      {loading ? (
        <Spinner />
      ) : error ? (
        <Alert>{error}</Alert>
      ) : lists.length === 0 ? (
        <EmptyState
          title="No wish lists yet"
          action={
            <button className="btn btn-primary" onClick={() => setEditing({})}>
              Create your first list
            </button>
          }
        >
          Make one for your next birthday, Christmas or any big day.
        </EmptyState>
      ) : (
        <div className="card-grid">
          {lists.map((l) => (
            <WishlistCard key={l._id} list={l} onEdit={setEditing} onDelete={setDeleting} />
          ))}
        </div>
      )}

      {editing && (
        <Modal title={editing._id ? 'Edit wish list' : 'New wish list'} onClose={() => setEditing(null)}>
          <WishlistForm
            initial={editing}
            onSubmit={save}
            onCancel={() => setEditing(null)}
            submitLabel={editing._id ? 'Save changes' : 'Create list'}
          />
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete wish list?"
          message={`“${deleting.title}” and all ${deleting.itemCount || 0} of its items will be deleted. This can't be undone.`}
          onConfirm={remove}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  )
}
