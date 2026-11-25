import { useState } from 'react'
import { followApi } from '../api/api.js'
import useAsync from '../hooks/useAsync.js'
import Spinner from '../components/Spinner.jsx'
import Alert from '../components/Alert.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { PersonRow } from './Friends.jsx'

// Follow requests: approve or decline people who want to see my lists,
// and cancel requests I've sent.
export default function Requests() {
  const incoming = useAsync(() => followApi.incoming(), [])
  const outgoing = useAsync(() => followApi.outgoing(), [])
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const run = async (fn, msg) => {
    setError('')
    try {
      await fn()
      setNotice(msg)
    } catch (err) {
      setError(err.message)
    }
  }

  const approve = (r) =>
    run(async () => {
      await followApi.accept(r._id)
      incoming.setData((a) => a.filter((x) => x._id !== r._id))
    }, `${r.follower.name} can now see your wish lists.`)

  const decline = (r) =>
    run(async () => {
      await followApi.remove(r._id)
      incoming.setData((a) => a.filter((x) => x._id !== r._id))
    }, `Declined ${r.follower.name}'s request.`)

  const cancel = (r) =>
    run(async () => {
      await followApi.remove(r._id)
      outgoing.setData((a) => a.filter((x) => x._id !== r._id))
    }, `Cancelled your request to ${r.following.name}.`)

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Follow requests</h1>
          <p className="muted">Approved followers can see your lists and claim gifts.</p>
        </div>
      </div>
      <Alert type="success" onClose={() => setNotice('')}>
        {notice}
      </Alert>
      <Alert>{error}</Alert>

      <div className="grid-2 gap-lg">
        <section>
          <h2 className="section-title sm">Waiting for you ({incoming.data?.length ?? 0})</h2>
          {incoming.loading ? (
            <Spinner />
          ) : incoming.error ? (
            <Alert>{incoming.error}</Alert>
          ) : incoming.data.length === 0 ? (
            <EmptyState icon="📭" title="No pending requests" />
          ) : (
            <ul className="people-list card">
              {incoming.data.map((r) => (
                <PersonRow
                  key={r._id}
                  person={r.follower}
                  action={
                    <>
                      <button className="btn btn-sm btn-primary" onClick={() => approve(r)}>
                        Approve
                      </button>
                      <button className="btn btn-sm btn-ghost" onClick={() => decline(r)}>
                        Decline
                      </button>
                    </>
                  }
                />
              ))}
            </ul>
          )}
        </section>
        <section>
          <h2 className="section-title sm">Sent by you ({outgoing.data?.length ?? 0})</h2>
          {outgoing.loading ? (
            <Spinner />
          ) : outgoing.error ? (
            <Alert>{outgoing.error}</Alert>
          ) : outgoing.data.length === 0 ? (
            <EmptyState icon="✉️" title="No requests sent" />
          ) : (
            <ul className="people-list card">
              {outgoing.data.map((r) => (
                <PersonRow
                  key={r._id}
                  person={r.following}
                  extra={<span className="tag">Pending</span>}
                  action={
                    <button className="btn btn-sm btn-ghost" onClick={() => cancel(r)}>
                      Cancel
                    </button>
                  }
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
