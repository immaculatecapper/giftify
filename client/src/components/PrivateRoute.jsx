import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

// Wrap pages that need a signed-in user (and optionally an admin).
// Signed-out visitors are sent to Sign In and brought back afterwards.
export default function PrivateRoute({ children, adminOnly = false }) {
  const { isSignedIn, isAdmin } = useAuth()
  const location = useLocation()
  if (!isSignedIn) return <Navigate to="/signin" replace state={{ from: location.pathname }} />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />
  return children
}
