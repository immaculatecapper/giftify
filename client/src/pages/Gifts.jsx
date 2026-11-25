import { useState } from 'react'
import { Link } from 'react-router-dom'
import { itemApi } from '../api/api.js'
import useAsync from '../hooks/useAsync.js'
import Spinner from '../components/Spinner.jsx'
import Alert from '../components/Alert.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import Avatar from '../components/Avatar.jsx'
import { countdown, formatDate, formatPrice, occasionOf, plural, safeUrl } from '../utils/format.js'

// My Gifts: everything I've claimed for other people (my shopping list).
export default function Gifts() {
  const { data, setData, loading, error } = useAsync(() => itemApi.myClaims(), [])
  const [confirm, setConfirm] = useState(null)
  const [notice, setNotice] = useState('')

  const total = (data || []).reduce((s, i) => s + (Number(i.price) || 0), 0)

  const unclaim = async (item) => {
    await itemApi.unclaim(item._id)
    setData((a) => a.filter((i) => i._id !== item._id))
    setNotice(`Released “${item.name}” for someone else to claim.`)
  }
  const given = async (item) => {
    await itemApi.remove(item._id)
    setData((a) => a.filter((i) => i._id !== item._id))
    setNotice(`Marked “${item.name}” as given. 🎉`)
  }

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>My Gifts</h1>
          <p className="muted">Gifts you've said you'll buy. {data?.length ? `${plural(data.length, 'gift')} · ${formatPrice(total)}` : ''}</p>
        </div>
      </div>
      <Alert type="success" onClose={() => setNotice('')}>
        {notice}
      </Alert>
      {loading ? (
        <Spinner />
      ) : error ? (
        <Alert>{error}</Alert>
      ) : data.length === 0 ? (
        <EmptyState icon="🛍️" title="Nothing claimed yet" action={<Link to="/" className="btn btn-soft">Browse friends' lists</Link>}>
          Open a friend's wish list and press “I'll get this”.
        </EmptyState>
      ) : (
        <div className="table-wrap card">
          <table className="table">
            <thead>
              <tr>
                <th>Gift</th>
                <th>For</th>
                <th>Occasion</th>
                <th>Price</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((i) => {
                const occ = occasionOf(i.wishlist?.occasion)
                const link = safeUrl(i.url)
                return (
                  <tr key={i._id}>
                    <td>
                      <strong>{i.name}</strong>
                      {link && (
                        <>
                          {' '}
                          <a href={link} target="_blank" rel="noopener noreferrer" className="small">
                            ↗
                          </a>
                        </>
                      )}
                    </td>
                    <td>
                      <span className="owner-line">
                        <Avatar user={i.owner} size={24} /> {i.owner?.name}
                      </span>
                    </td>
                    <td>
                      {i.wishlist ? (
                        <Link to={`/users/${i.owner?._id}/lists/${i.wishlist._id}`}>
                          {occ.emoji} {i.wishlist.title}
                        </Link>
                      ) : (
                        '—'
                      )}
                      {i.wishlist?.eventDate && (
                        <div className="muted small">
                          {formatDate(i.wishlist.eventDate)} · {countdown(i.wishlist.eventDate)}
                        </div>
                      )}
                    </td>
                    <td>{formatPrice(i.price) || '—'}</td>
                    <td className="row-actions">
                      <button className="btn btn-sm btn-ghost" onClick={() => setConfirm({ item: i, kind: 'unclaim' })}>
                        Unclaim
                      </button>
                      <button className="btn btn-sm btn-soft" onClick={() => setConfirm({ item: i, kind: 'given' })}>
                        Gift given
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {confirm && (
        <ConfirmDialog
          title={confirm.kind === 'given' ? 'Mark gift as given?' : 'Unclaim this gift?'}
          message={
            confirm.kind === 'given'
              ? `“${confirm.item.name}” will be removed from ${confirm.item.owner?.name}'s list.`
              : `Other friends will be able to claim “${confirm.item.name}” again.`
          }
          confirmLabel={confirm.kind === 'given' ? 'Gift given' : 'Unclaim'}
          onConfirm={() => (confirm.kind === 'given' ? given(confirm.item) : unclaim(confirm.item))}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
