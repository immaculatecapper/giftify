import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import { expressjwt } from 'express-jwt'
import config from '../../config/config.js'

// POST /auth/signin - sign in with email OR username + password, returns a signed JWT
const signin = async (req, res) => {
  try {
    const login = (req.body.email || req.body.username || '').toLowerCase().trim()
    if (!login || !req.body.password) {
      return res.status(400).json({ error: 'Email (or username) and password are required' })
    }
    const user = await User.findOne({ $or: [{ email: login }, { username: login }] })
    if (!user) return res.status(401).json({ error: 'User not found' })
    if (!user.authenticate(req.body.password)) {
      return res.status(401).json({ error: "Email and password don't match." })
    }
    // The role is put inside the token so protected routes can check it
    const token = jwt.sign({ _id: user._id, role: user.role }, config.jwtSecret, { expiresIn: '1d' })
    res.cookie('t', token, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000), httpOnly: true })
    return res.json({
      token,
      user: { _id: user._id, name: user.name, username: user.username, email: user.email, role: user.role },
    })
  } catch (err) {
    return res.status(401).json({ error: 'Could not sign in' })
  }
}

// GET /auth/signout - clear the token cookie (the client should also discard its token)
const signout = (req, res) => {
  res.clearCookie('t')
  return res.status(200).json({ message: 'signed out' })
}

// GET /auth/me - returns the signed-in user's own account
const me = async (req, res) => {
  const user = await User.findById(req.auth._id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  return res.json(user)
}

// Middleware: request must carry a valid "Authorization: Bearer <token>" header.
// The decoded token ({ _id, role }) is put on req.auth
const requireSignin = expressjwt({
  secret: config.jwtSecret,
  algorithms: ['HS256'],
  requestProperty: 'auth',
})

// Middleware: signed-in user must have the "admin" role (re-checked in the database)
const isAdmin = async (req, res, next) => {
  try {
    const user = req.auth && (await User.findById(req.auth._id).select('role'))
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }
    next()
  } catch (err) {
    return res.status(403).json({ error: 'Admin access required' })
  }
}

// Middleware: a user may only change their OWN account (admins may change any)
const hasAuthorization = (req, res, next) => {
  const isOwner = req.profile && req.auth && String(req.profile._id) === String(req.auth._id)
  const isAdminUser = req.auth && req.auth.role === 'admin'
  if (!isOwner && !isAdminUser) {
    return res.status(403).json({ error: 'User is not authorized' })
  }
  next()
}

export default { signin, signout, me, requireSignin, isAdmin, hasAuthorization }
