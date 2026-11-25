import { Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { userApi } from '../api/api.js'
import useAsync from '../hooks/useAsync.js'
import Avatar from '../components/Avatar.jsx'
import FollowButton from '../components/FollowButton.jsx'
import WishlistCard from '../components/WishlistCard.jsx'
import Spinner from '../components/Spinner.jsx'
import Alert from '../components/Alert.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { plural } from '../utils/format.js'

// Someone else's profile. Lists are only shown once they've approved your follow request.
export default function UserProfile() {
  const { userId } = useParams()
  const { user, isAdmin } = useAuth()
  const profile = useAsync(() => userApi.read(userId), [userId])
  const canSee = profile.data && (profile.data.followStatus === 'accepted' || isAdmin)
  const lists = useAsync(() => (canSee ? userApi.wishlists(userId) : Promise.resolve([])), [userId, canSee])

  if (userId === user._id) return <Navigate to="/profile" replace />
  if (profile.loading) return <Spinner />
  if (profile.error)
    return (
      <div className="container page">
        <EmptyState icon="🤔" title="User not found">
          {profile.error}
        </EmptyState>
      </div>
    )

  const p = profile.data
  const onFollowChange = (status, followId) =>
    profile.setData((old) => ({
      ...old,
      followStatus: status,
      followId,
      followerCount: old.followerCount + (old.followStatus === 'accepted' && status === 'none' ? -1 : 0),
    }))

  return (
    <div className="container page">
      <section className="card profile-card">
        <div className="profile-top">
          <Avatar user={p} size={88} />
          <div className="grow">
            <h1>{p.name}</h1>
            <p className="muted">@{p.username}</p>
            {p.bio && <p className="bio">{p.bio}</p>}
            <p className="stats">
              <strong>{plural(p.followerCount, 'follower')}</strong> · <strong>{p.followingCount} following</strong>
            </p>
          </div>
          <FollowButton userId={p._id} status={p.followStatus} followId={p.followId} onChange={onFollowChange} />
        </div>
      </section>

      {!canSee ? (
        <EmptyState icon="🔒" title="This account is private">
          {p.followStatus === 'pending'
            ? `Your request has been sent. You'll see ${p.name.split(' ')[0]}'s wish lists once they approve it.`
            : `Request to follow ${p.name.split(' ')[0]} to see their wish lists.`}
        </EmptyState>
      ) : (
        <section className="section-tight">
          <h2 className="section-title sm">Wish lists</h2>
          {lists.loading ? (
            <Spinner />
          ) : lists.error ? (
            <Alert>{lists.error}</Alert>
          ) : lists.data.length === 0 ? (
            <EmptyState title={`${p.name.split(' ')[0]} hasn't made any lists yet`} />
          ) : (
            <div className="card-grid">
              {lists.data.map((l) => (
                <WishlistCard key={l._id} list={l} to={`/users/${p._id}/lists/${l._id}`} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
