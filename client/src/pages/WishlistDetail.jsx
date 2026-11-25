import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { itemApi, wishlistApi } from '../api/api.js'
import useAsync from '../hooks/useAsync.js'
import ItemCard from '../components/ItemCard.jsx'
import ItemForm from '../components/ItemForm.jsx'
import WishlistForm from '../components/WishlistForm.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Spinner from '../components/Spinner.jsx'
import Alert from '../components/Alert.jsx'
import Avatar from '../components/Avatar.jsx'
import { countdown, formatDate, formatPrice, occasionOf, plural } from '../utils/format.js'

// One wish list and its items.
// Owner: full CRUD on items (and can edit / delete the list).
// Approved follower: claim / unclaim gifts, or remove a gift they've given.
export default function WishlistDetail() {
  const { listId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const list = useAsync(() => wishlistApi.read(listId), [listId])
  const items = useAsync(() => itemApi.list(listId), [listId])
  const [itemForm, setItemForm] = useState(null) // null | {} | item
  const [editingList, setEditingList] = useState(false)
  const [confirm, setConfirm] = useState(null) // { title, message, label, action }
  const [busyId, setBusyId] = useState(null)
  const [notice, setNotice] = useState({ type: 'success', text: '' })

  if (list.loading) return <Spinner />
  if (list.error)
    return (
      <div className="container page">
        <EmptyState icon={list.status === 403 ? '🔒' : '🤔'} title={list.status === 403 ? 'This wish list is private' : 'Wish list not found'}>
          {list.status === 403 ? 'Follow the owner and wait for them to approve you to see it.' : list.error}
        </EmptyState>
      </div>
    )

  const wl = list.data
  const isOwner = String(wl.owner?._id) === String(user._id)
  const occ = occasionOf(wl.occasion)
  const all = items.data || []
  const total = all.reduce((sum, i) => sum + (Number(i.price) || 0), 0)

  const replaceItem = (updated) => items.setData((arr) => arr.map((i) => (i._id === updated._id ? updated : i)))
  const dropItem = (id) => {
    items.setData((arr) => arr.filter((i) => i._id !== id))
    list.setData((l) => ({ ...l, itemCount: Math.max(0, (l.itemCount || 1) - 1) }))
  }

  // --- owner actions -------------------------------------------------------
  const saveItem = async (values) => {
    if (itemForm._id) {
      replaceItem(await itemApi.update(itemForm._id, values))
      setNotice({ type: 'success', text: 'Item updated.' })
    } else {
      const created = await itemApi.create(listId, values)
      items.setData((arr) => [...arr, created])
      list.setData((l) => ({ ...l, itemCount: (l.itemCount || 0) + 1 }))
      setNotice({ type: 'success', text: `Added “${created.name}”.` })
    }
    setItemForm(null)
  }

  const saveList = async (values) => {
    const updated = await wishlistApi.update(listId, values)
    list.setData((l) => ({ ...l, ...updated, owner: l.owner }))
    setEditingList(false)
    setNotice({ type: 'success', text: 'Wish list updated.' })
  }

  // --- follower actions ----------------------------------------------------
  const act = async (item, fn, text) => {
    setBusyId(item._id)
    try {
      await fn()
      setNotice({ type: 'success', text })
    } catch (err) {
      setNotice({ type: 'error', text: err.message })
      items.reload() // someone else may have claimed it first
    } finally {
      setBusyId(null)
    }
  }
  const claim = (item) => act(item, async () => replaceItem((await itemApi.claim(item._id)).item), `You're getting “${item.name}”. It's on your My Gifts list.`)
  const unclaim = (item) => act(item, async () => replaceItem((await itemApi.unclaim(item._id)).item), 'Claim removed.')

  return (
    <div className="container page">
      <p className="crumbs">
        {isOwner ? <Link to="/lists">← My Lists</Link> : <Link to={`/users/${wl.owner._id}`}>← {wl.owner.name}</Link>}
      </p>
      <header className={`list-hero occ-${occ.value}`}>
        <div>
          <span className="chip">
            {occ.emoji} {occ.label}
          </span>
          <h1>{isOwner ? wl.title : `${wl.owner.name.split(' ')[0]}'s ${wl.title}`}</h1>
          <p className="meta">
            📅 {wl.eventDate ? `${formatDate(wl.eventDate)} · ${countdown(wl.eventDate)}` : 'No date set'} · {plural(all.length, 'item')}
            {total > 0 && ` · ${formatPrice(total)} total`}
          </p>
          {wl.description && <p>{wl.description}</p>}
          {!isOwner && (
            <p className="owner-line">
              <Avatar user={wl.owner} size={24} /> @{wl.owner.username}
            </p>
          )}
        </div>
        {isOwner && (
          <div className="hero-actions">
            <button className="btn btn-ghost" onClick={() => setEditingList(true)}>
              Edit list
            </button>
            <button
              className="btn btn-ghost danger"
              onClick={() =>
                setConfirm({
                  title: 'Delete wish list?',
                  message: `“${wl.title}” and its ${plural(all.length, 'item')} will be deleted.`,
                  action: async () => {
                    await wishlistApi.remove(listId)
                    navigate('/lists', { replace: true })
                  },
                })
              }
            >
              Delete list
            </button>
            <button className="btn btn-primary" onClick={() => setItemForm({})}>
              + Add Item
            </button>
          </div>
        )}
      </header>

      <Alert type={notice.type} onClose={() => setNotice({ ...notice, text: '' })}>
        {notice.text}
      </Alert>

      {isOwner && <p className="info-note">ℹ️ Claimed items are hidden from you so your gifts stay a surprise.</p>}

      {items.loading ? (
        <Spinner />
      ) : items.error ? (
        <Alert>{items.error}</Alert>
      ) : all.length === 0 ? (
        <EmptyState
          title="No items yet"
          action={
            isOwner && (
              <button className="btn btn-primary" onClick={() => setItemForm({})}>
                Add your first item
              </button>
            )
          }
        >
          {isOwner ? 'Add the gifts you would love to get.' : 'Check back later.'}
        </EmptyState>
      ) : (
        <div className="item-list">
          {all.map((item) => (
            <ItemCard
              key={item._id}
              item={item}
              isOwner={isOwner}
              busy={busyId === item._id}
              onEdit={setItemForm}
              onDelete={(i) =>
                setConfirm({
                  title: 'Delete item?',
                  message: `Remove “${i.name}” from this list?`,
                  action: async () => {
                    await itemApi.remove(i._id)
                    dropItem(i._id)
                  },
                })
              }
              onClaim={claim}
              onUnclaim={unclaim}
              onGiven={(i) =>
                setConfirm({
                  title: 'Mark gift as given?',
                  message: `This removes “${i.name}” from ${wl.owner.name}'s list. Only do this once you've handed it over.`,
                  label: 'Gift given',
                  action: async () => {
                    await itemApi.remove(i._id)
                    dropItem(i._id)
                  },
                })
              }
            />
          ))}
        </div>
      )}

      {itemForm && (
        <Modal title={itemForm._id ? 'Edit item' : 'Add an item'} onClose={() => setItemForm(null)}>
          <ItemForm initial={itemForm} onSubmit={saveItem} onCancel={() => setItemForm(null)} submitLabel={itemForm._id ? 'Save changes' : 'Add item'} />
        </Modal>
      )}
      {editingList && (
        <Modal title="Edit wish list" onClose={() => setEditingList(false)}>
          <WishlistForm initial={wl} onSubmit={saveList} onCancel={() => setEditingList(false)} submitLabel="Save changes" />
        </Modal>
      )}
      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.label || 'Delete'}
          onConfirm={confirm.action}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
