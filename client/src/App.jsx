import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'
import Home from './pages/Home.jsx'
import Signin from './pages/Signin.jsx'
import Signup from './pages/Signup.jsx'

// Pages behind sign-in are lazy-loaded: the landing page downloads less JavaScript (performance)
const MyLists = lazy(() => import('./pages/MyLists.jsx'))
const WishlistDetail = lazy(() => import('./pages/WishlistDetail.jsx'))
const Friends = lazy(() => import('./pages/Friends.jsx'))
const Requests = lazy(() => import('./pages/Requests.jsx'))
const Gifts = lazy(() => import('./pages/Gifts.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const UserProfile = lazy(() => import('./pages/UserProfile.jsx'))
const AdminUsers = lazy(() => import('./pages/AdminUsers.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

const priv = (el, adminOnly) => <PrivateRoute adminOnly={adminOnly}>{el}</PrivateRoute>

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/lists" element={priv(<MyLists />)} />
        <Route path="/lists/:listId" element={priv(<WishlistDetail />)} />
        <Route path="/friends" element={priv(<Friends />)} />
        <Route path="/requests" element={priv(<Requests />)} />
        <Route path="/gifts" element={priv(<Gifts />)} />
        <Route path="/profile" element={priv(<Profile />)} />
        <Route path="/users/:userId" element={priv(<UserProfile />)} />
        <Route path="/users/:userId/lists/:listId" element={priv(<WishlistDetail />)} />
        <Route path="/admin/users" element={priv(<AdminUsers />, true)} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
