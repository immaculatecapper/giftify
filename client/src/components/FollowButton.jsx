import { useState } from 'react'
import { followApi } from '../api/api.js'

// Shows the right follow action for a profile:
// none -> "Request to Follow", pending -> "Requested" (cancel), accepted -> "Following ✓" (unfollow)
export default function FollowButton({ userId, status, followId, onChange }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (status === 'self') return null

  const run = async (fn) => {
    setBusy(true)
    setError('')
    try {
      await fn()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const request = () =>
    run(async () => {
      const { follow } = await followApi.request(userId)
      onChange?.('pending', follow._id)
    })

  const remove = () =>
    run(async () => {
      await followApi.remove(followId)
      onChange?.('none', null)
    })

  return (
    <div className="follow-btn">
      {status === 'none' && (
        <button className="btn btn-primary" onClick={request} disabled={busy}>
          Request to Follow
        </button>
      )}
      {status === 'pending' && (
        <button className="btn btn-soft" onClick={remove} disabled={busy || !followId} title="Cancel request">
          Requested · Cancel
        </button>
      )}
      {status === 'accepted' && (
        <button className="btn btn-soft" onClick={remove} disabled={busy || !followId} title="Unfollow">
          Following ✓ · Unfollow
        </button>
      )}
      {error && <small className="field-error">{error}</small>}
    </div>
  )
}
