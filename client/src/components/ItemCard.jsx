import { formatPrice, safeUrl } from '../utils/format.js'

// One gift item.
// - Owner view (isOwner): Edit / Delete. Claim info is never shown (the API doesn't even send it).
// - Follower view: "I'll get this", or "Claimed" / "You're getting this" + Unclaim / Gift given.
export default function ItemCard({ item, isOwner, onEdit, onDelete, onClaim, onUnclaim, onGiven, busy }) {
  const img = safeUrl(item.imageUrl)
  const link = safeUrl(item.url)
  const claimedByOther = !isOwner && item.isClaimed && !item.claimedByMe

  return (
    <article
      className={'card item-card' + (claimedByOther ? ' is-claimed' : '') + (item.claimedByMe ? ' is-mine' : '')}
      data-testid="item-card"
    >
      <div className="item-img">
        {img ? <img src={img} alt="" loading="lazy" /> : <span aria-hidden="true">🎁</span>}
      </div>
      <div className="item-body">
        <div className="item-title-row">
          <h3>{item.name}</h3>
          <span className={`priority priority-${item.priority}`}>{item.priority}</span>
        </div>
        <p className="item-meta">
          {item.price !== undefined && item.price !== null && <strong>{formatPrice(item.price)}</strong>}
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer">
              View product ↗
            </a>
          )}
        </p>
        {item.notes && <p className="muted small">{item.notes}</p>}
      </div>

      <div className="item-actions">
        {isOwner ? (
          <>
            <button className="btn btn-sm btn-ghost" onClick={() => onEdit(item)} disabled={busy}>
              Edit
            </button>
            <button className="btn btn-sm btn-ghost danger" onClick={() => onDelete(item)} disabled={busy}>
              Delete
            </button>
          </>
        ) : item.claimedByMe ? (
          <>
            <span className="tag tag-mine">✓ You're getting this</span>
            <button className="btn btn-sm btn-ghost" onClick={() => onUnclaim(item)} disabled={busy}>
              Unclaim
            </button>
            <button className="btn btn-sm btn-soft" onClick={() => onGiven(item)} disabled={busy}>
              Gift given
            </button>
          </>
        ) : item.isClaimed ? (
          <span className="tag tag-claimed">Claimed by someone</span>
        ) : (
          <button className="btn btn-sm btn-primary" onClick={() => onClaim(item)} disabled={busy}>
            I'll get this
          </button>
        )}
      </div>
    </article>
  )
}
