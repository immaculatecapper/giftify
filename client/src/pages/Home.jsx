import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { wishlistApi } from '../api/api.js'
import useAsync from '../hooks/useAsync.js'
import WishlistCard from '../components/WishlistCard.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Spinner from '../components/Spinner.jsx'
import Alert from '../components/Alert.jsx'
import { LogoMark } from '../components/Logo.jsx'
import { OCCASIONS } from '../utils/format.js'

// Landing page.
// Signed out: hero with the site name + logo, how it works, occasions, Sign Up / Sign In.
// Signed in: "Upcoming from friends" (lists from people you follow) and "My wish lists".
export default function Home() {
  const { isSignedIn } = useAuth()
  return isSignedIn ? <Dashboard /> : <Landing />
}

function Landing() {
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Private wish lists · Surprise intact</p>
            <h1>
              Wish lists your friends can <span className="grad-text">actually use.</span>
            </h1>
            <p className="lead">
              Make a list for every birthday, holiday and big day. Share it only with people you approve. Friends claim
              gifts so nobody doubles up — and you never see what's been claimed.
            </p>
            <div className="hero-cta">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Create your free account
              </Link>
              <Link to="/signin" className="btn btn-ghost btn-lg">
                Sign In
              </Link>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="float-card fc-1">
              <span>🎂</span>
              <div>
                <strong>Birthday 2027</strong>
                <small>3 items · In 108 days</small>
              </div>
            </div>
            <LogoMark size={190} />
            <div className="float-card fc-2">
              <span>✓</span>
              <div>
                <strong>Kindle Paperwhite</strong>
                <small>Claimed by a friend</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container section">
        <h2 className="section-title">How Giftify works</h2>
        <ol className="steps">
          <li className="card">
            <span className="step-num">1</span>
            <h3>Make your lists</h3>
            <p className="muted">Add items with links, prices and priorities for each occasion.</p>
          </li>
          <li className="card">
            <span className="step-num">2</span>
            <h3>Approve your people</h3>
            <p className="muted">Every account is private. Only followers you approve can see your lists.</p>
          </li>
          <li className="card">
            <span className="step-num">3</span>
            <h3>Friends claim gifts</h3>
            <p className="muted">They mark what they're buying so nobody doubles up. You stay surprised.</p>
          </li>
        </ol>
      </section>

      <section className="container section">
        <h2 className="section-title">Lists for every occasion</h2>
        <ul className="occasion-grid">
          {OCCASIONS.map((o) => (
            <li key={o.value} className={`card occasion occ-${o.value}`}>
              <span aria-hidden="true">{o.emoji}</span>
              {o.label}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

function Dashboard() {
  const { user } = useAuth()
  const feed = useAsync(() => wishlistApi.feed(), [])
  const mine = useAsync(() => wishlistApi.mine(), [])
  const first = user.name?.split(' ')[0]

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Hi {first} 👋</h1>
          <p className="muted">Here's what's coming up.</p>
        </div>
        <Link to="/lists" className="btn btn-primary">
          + New Wish List
        </Link>
      </div>

      <section className="section-tight">
        <h2 className="section-title sm">Upcoming from friends</h2>
        {feed.loading ? (
          <Spinner />
        ) : feed.error ? (
          <Alert>{feed.error}</Alert>
        ) : feed.data.length === 0 ? (
          <EmptyState icon="👥" title="No friends' lists yet" action={<Link to="/friends" className="btn btn-soft">Find people to follow</Link>}>
            Follow friends — once they approve you, their wish lists show up here.
          </EmptyState>
        ) : (
          <div className="card-grid">
            {feed.data.map((l) => (
              <WishlistCard key={l._id} list={l} showOwner />
            ))}
          </div>
        )}
      </section>

      <section className="section-tight">
        <h2 className="section-title sm">
          My wish lists <Link to="/lists" className="small-link">Manage →</Link>
        </h2>
        {mine.loading ? (
          <Spinner />
        ) : mine.error ? (
          <Alert>{mine.error}</Alert>
        ) : mine.data.length === 0 ? (
          <EmptyState title="You haven't made a list yet" action={<Link to="/lists" className="btn btn-primary">Create a wish list</Link>} />
        ) : (
          <div className="card-grid">
            {mine.data.map((l) => (
              <WishlistCard key={l._id} list={l} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
