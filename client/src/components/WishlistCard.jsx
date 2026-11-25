import { Link } from 'react-router-dom'
import { countdown, formatDate, occasionOf, plural } from '../utils/format.js'
import Avatar from './Avatar.jsx'

// Card for one wish list. Owners get Edit / Delete buttons; friends see whose list it is.
// "to" lets friends' lists open under /users/:id/lists/:listId so the navbar highlights Friends
export default function WishlistCard({ list, onEdit, onDelete, showOwner = false, to }) {
  const occ = occasionOf(list.occasion)
  const href = to || (showOwner && list.owner?._id ? `/users/${list.owner._id}/lists/${list._id}` : `/lists/${list._id}`)
  return (
    <article className={`card list-card occ-${occ.value}`} data-testid="wishlist-card">
      <div className="list-card-top">
        <span className="chip">
          <span aria-hidden="true">{occ.emoji}</span> {occ.label}
        </span>
        {list.eventDate && <span className="countdown">{countdown(list.eventDate)}</span>}
      </div>
      <h3>
        <Link to={href} className="stretched">
          {list.title}
        </Link>
      </h3>
      {showOwner && list.owner && (
        <p className="owner-line">
          <Avatar user={list.owner} size={24} /> {list.owner.name}
        </p>
      )}
      {list.description && <p className="muted clamp-2">{list.description}</p>}
      <p className="meta">
        📅 {list.eventDate ? formatDate(list.eventDate) : 'No date'} · {plural(list.itemCount || 0, 'item')}
      </p>
      {(onEdit || onDelete) && (
        <div className="card-actions">
          <Link to={href} className="btn btn-sm btn-soft">
            Open
          </Link>
          {onEdit && (
            <button className="btn btn-sm btn-ghost" onClick={() => onEdit(list)}>
              Edit
            </button>
          )}
          {onDelete && (
            <button className="btn btn-sm btn-ghost danger" onClick={() => onDelete(list)}>
              Delete
            </button>
          )}
        </div>
      )}
    </article>
  )
}
