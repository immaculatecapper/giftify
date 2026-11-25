import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { followApi } from '../api/api.js'
import Logo from './Logo.jsx'

// Authenticated navigation bar.
// - Signed out: Home, Sign In, Sign Up
// - Signed in: Home, My Lists, Friends, Requests (with a badge), My Gifts, My Profile, Sign Out
// - Admins also get "Users"
// NavLink adds class "active" + aria-current="page" to the link for the current page,
// which the CSS underlines so the user can always see where they are.
export default function Navbar() {
  const { user, isSignedIn, isAdmin, signout } = useAuth()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()

  // close the mobile menu after navigating
  useEffect(() => setOpen(false), [location.pathname])

  // refresh the follow-request badge whenever the page changes
  useEffect(() => {
    if (!isSignedIn) return setPending(0)
    let alive = true
    followApi
      .incoming()
      .then((r) => alive && setPending(r.length))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [isSignedIn, location.pathname])

  const handleSignout = async () => {
    await signout()
    navigate('/signin', { replace: true, state: { message: 'You have been signed out.' } })
  }

  // a friend's profile or list (/users/...) counts as being in "Friends"
  const inFriends = location.pathname.startsWith('/users/')

  const link = (to, label, extra) => (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) => 'nav-link' + (isActive || (to === '/friends' && inFriends) ? ' active' : '')}
    >
      {label}
      {extra}
    </NavLink>
  )

  return (
    <header className="navbar">
      <nav className="nav-inner container" aria-label="Main navigation">
        <Link to="/" className="brand" aria-label="Giftify home">
          <Logo />
        </Link>

        <button
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="nav-links"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">Menu</span>☰
        </button>

        <div id="nav-links" className={'nav-links' + (open ? ' open' : '')}>
          <div className="nav-main">
            {link('/', 'Home')}
            {isSignedIn && (
              <>
                {link('/lists', 'My Lists')}
                {link('/friends', 'Friends')}
                {link(
                  '/requests',
                  'Requests',
                  pending > 0 && (
                    <span className="badge" aria-label={`${pending} pending`}>
                      {pending}
                    </span>
                  )
                )}
                {link('/gifts', 'My Gifts')}
                {isAdmin && link('/admin/users', 'Users')}
              </>
            )}
          </div>
          <div className="nav-auth">
            {isSignedIn ? (
              <>
                {link('/profile', 'My Profile')}
                <span className="nav-user" title={user.email}>
                  @{user.username}
                </span>
                <button className="btn btn-ghost btn-sm" onClick={handleSignout}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                {link('/signin', 'Sign In')}
                <NavLink to="/signup" className={({ isActive }) => 'btn btn-primary btn-sm' + (isActive ? ' active' : '')}>
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
