import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { followApi, userApi } from '../api/api.js'
import useAsync from '../hooks/useAsync.js'
import Avatar from '../components/Avatar.jsx'
import Spinner from '../components/Spinner.jsx'
import Alert from '../components/Alert.jsx'
import EmptyState from '../components/EmptyState.jsx'

// Friends: search people, see who I follow and who follows me.
export default function Friends() {
  const { user } = useAuth()
  const [q, setQ] = useState('')
  const [results, setResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const following = useAsync(() => userApi.following(user._id), [user._id])
  const followers = useAsync(() => userApi.followers(user._id), [user._id])

  // search as you type (debounced so we don't call the API on every key press)
  useEffect(() => {
    if (!q.trim()) return setResults(null)
    setSearching(true)
    const t = setTimeout(async () => {
      try {
        const found = await userApi.search(q.trim())
        setResults(found.filter((u) => u._id !== user._id))
        setError('')
      } catch (err) {
        setError(err.message)
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [q, user._id])

  const unfollow = async (f) => {
    await followApi.remove(f.followId)
    following.setData((arr) => arr.filter((x) => x.followId !== f.followId))
  }
  const removeFollower = async (f) => {
    await followApi.remove(f.followId)
    followers.setData((arr) => arr.filter((x) => x.followId !== f.followId))
  }

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Friends</h1>
          <p className="muted">Find people and request to follow them.</p>
        </div>
      </div>

      <div className="card search-card">
        <label htmlFor="people-search" className="sr-only">
          Search people
        </label>
        <input
          id="people-search"
          className="search-input"
          type="search"
          placeholder="🔍 Search by name or username"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {error && <Alert>{error}</Alert>}
        {searching && <Spinner />}
        {results && !searching && (
          <ul className="people-list" aria-label="Search results">
            {results.length === 0 && <li className="muted">No one found for “{q}”.</li>}
            {results.map((u) => (
              <PersonRow key={u._id} person={u} action={<Link to={`/users/${u._id}`} className="btn btn-sm btn-soft">View profile</Link>} />
            ))}
          </ul>
        )}
      </div>

      <div className="grid-2 gap-lg">
        <section>
          <h2 className="section-title sm">Following ({following.data?.length ?? 0})</h2>
          <PeopleSection state={following} empty="You aren't following anyone yet." actionLabel="Unfollow" onAction={unfollow} />
        </section>
        <section>
          <h2 className="section-title sm">Followers ({followers.data?.length ?? 0})</h2>
          <PeopleSection state={followers} empty="No approved followers yet." actionLabel="Remove" onAction={removeFollower} />
        </section>
      </div>
    </div>
  )
}

function PeopleSection({ state, empty, actionLabel, onAction }) {
  if (state.loading) return <Spinner />
  if (state.error) return <Alert>{state.error}</Alert>
  if (!state.data.length) return <EmptyState icon="👥" title={empty} />
  return (
    <ul className="people-list card">
      {state.data.map((f) => (
        <PersonRow
          key={f.followId}
          person={f.user}
          action={
            <button className="btn btn-sm btn-ghost" onClick={() => onAction(f)}>
              {actionLabel}
            </button>
          }
        />
      ))}
    </ul>
  )
}

export function PersonRow({ person, action, extra }) {
  return (
    <li className="person">
      <Avatar user={person} />
      <div className="person-info">
        <Link to={`/users/${person._id}`} className="person-name">
          {person.name}
        </Link>
        <span className="muted small">@{person.username}</span>
        {extra}
      </div>
      <div className="person-actions">{action}</div>
    </li>
  )
}
