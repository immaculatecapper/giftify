import User from '../models/user.model.js'
import Follow from '../models/follow.model.js'
import Wishlist from '../models/wishlist.model.js'
import Item from '../models/item.model.js'
import errorHandler from '../helpers/dbErrorHandler.js'
import { isSelf, isAdmin } from '../helpers/access.js'

// Fields a user is allowed to set on their own account
const EDITABLE = ['name', 'username', 'email', 'bio', 'avatarUrl', 'birthday', 'password']
const PUBLIC_FIELDS = 'name username bio avatarUrl created'

const pick = (obj, keys) =>
  keys.reduce((out, k) => (obj[k] !== undefined ? { ...out, [k]: obj[k] } : out), {})

// POST /api/users - sign up (public)
const create = async (req, res) => {
  try {
    const user = new User(pick(req.body, EDITABLE)) // role can never be set here
    await user.save()
    return res.status(201).json({ message: 'Successfully signed up!', user })
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

// GET /api/users?q=search - signed-in users can search people to follow
const list = async (req, res) => {
  try {
    const filter = {}
    if (req.query.q) {
      const q = new RegExp(req.query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      filter.$or = [{ name: q }, { username: q }]
    }
    // Admins see full accounts; everyone else sees public profile fields only
    const fields = isAdmin(req.auth) ? '' : PUBLIC_FIELDS
    const users = await User.find(filter).select(fields).sort({ name: 1 }).limit(50)
    return res.json(users)
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

// router.param - loads the user for any route with :userId
const userByID = async (req, res, next, id) => {
  try {
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    req.profile = user
    next()
  } catch (err) {
    return res.status(400).json({ error: 'Could not retrieve user' })
  }
}

// GET /api/users/:userId - profile with follower counts and the viewer's follow status
const read = async (req, res) => {
  try {
    const user = req.profile
    const [followers, following, myFollow] = await Promise.all([
      Follow.countDocuments({ following: user._id, status: 'accepted' }),
      Follow.countDocuments({ follower: user._id, status: 'accepted' }),
      Follow.findOne({ follower: req.auth._id, following: user._id }),
    ])
    const full = isSelf(req.auth, user._id) || isAdmin(req.auth)
    const profile = full ? user.toJSON() : pick(user.toJSON(), ['_id', ...PUBLIC_FIELDS.split(' ')])
    return res.json({
      ...profile,
      followerCount: followers,
      followingCount: following,
      // "none" | "pending" | "accepted" | "self"
      followStatus: isSelf(req.auth, user._id) ? 'self' : myFollow ? myFollow.status : 'none',
    })
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

// PUT /api/users/:userId - owner (or admin) updates the account
const update = async (req, res) => {
  try {
    const user = req.profile
    Object.assign(user, pick(req.body, EDITABLE))
    await user.save()
    return res.json(user)
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

// DELETE /api/users/:userId - owner (or admin) deletes the account and all their data
const remove = async (req, res) => {
  try {
    const id = req.profile._id
    await Promise.all([
      Item.deleteMany({ owner: id }),
      Wishlist.deleteMany({ owner: id }),
      Follow.deleteMany({ $or: [{ follower: id }, { following: id }] }),
      // Release any gifts this user had claimed for other people
      Item.updateMany({ claimedBy: id }, { claimedBy: null, claimedAt: null }),
    ])
    await req.profile.deleteOne()
    return res.json({ message: 'User deleted', user: req.profile })
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

export default { create, list, userByID, read, update, remove }
