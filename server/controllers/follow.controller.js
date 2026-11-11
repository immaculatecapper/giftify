import Follow from '../models/follow.model.js'
import User from '../models/user.model.js'
import errorHandler from '../helpers/dbErrorHandler.js'
import { isSelf, isAdmin, canViewContentOf } from '../helpers/access.js'

const PUBLIC_FIELDS = 'name username avatarUrl'

// POST /api/follows  { userId } - send a follow request (always starts as "pending")
const request = async (req, res) => {
  try {
    const targetId = req.body.userId
    if (!targetId) return res.status(400).json({ error: 'userId is required' })
    if (isSelf(req.auth, targetId)) return res.status(400).json({ error: "You can't follow yourself" })
    const target = await User.exists({ _id: targetId })
    if (!target) return res.status(404).json({ error: 'User not found' })

    const existing = await Follow.findOne({ follower: req.auth._id, following: targetId })
    if (existing) {
      return res.status(409).json({ error: `Follow already ${existing.status}`, follow: existing })
    }
    const follow = await Follow.create({ follower: req.auth._id, following: targetId })
    return res.status(201).json({ message: 'Follow request sent', follow })
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

// GET /api/follows/requests - pending requests sent TO me (incoming)
const incoming = async (req, res) => {
  try {
    const requests = await Follow.find({ following: req.auth._id, status: 'pending' })
      .populate('follower', PUBLIC_FIELDS)
      .sort({ created: -1 })
    return res.json(requests)
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

// GET /api/follows/sent - pending requests I have sent (outgoing)
const outgoing = async (req, res) => {
  try {
    const requests = await Follow.find({ follower: req.auth._id, status: 'pending' })
      .populate('following', PUBLIC_FIELDS)
      .sort({ created: -1 })
    return res.json(requests)
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

// router.param - loads the follow document for any route with :followId
const followByID = async (req, res, next, id) => {
  try {
    const follow = await Follow.findById(id)
    if (!follow) return res.status(404).json({ error: 'Follow not found' })
    req.follow = follow
    next()
  } catch (err) {
    return res.status(400).json({ error: 'Could not retrieve follow' })
  }
}

// PUT /api/follows/:followId/accept - only the person being followed can approve
const accept = async (req, res) => {
  try {
    if (!isSelf(req.auth, req.follow.following)) {
      return res.status(403).json({ error: 'Only the requested user can accept this request' })
    }
    req.follow.status = 'accepted'
    req.follow.respondedAt = new Date()
    await req.follow.save()
    return res.json({ message: 'Follow request accepted', follow: req.follow })
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

// DELETE /api/follows/:followId - either side can remove the follow:
// the recipient declines a request / removes a follower; the sender cancels / unfollows
const remove = async (req, res) => {
  try {
    const f = req.follow
    if (!isSelf(req.auth, f.follower) && !isSelf(req.auth, f.following) && !isAdmin(req.auth)) {
      return res.status(403).json({ error: 'Not authorized to remove this follow' })
    }
    await f.deleteOne()
    return res.json({ message: 'Follow removed', follow: f })
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

// GET /api/users/:userId/followers  and  /api/users/:userId/following
// Accounts are private, so these lists are only shown to the user, approved followers, or admin
const listFor = (direction) => async (req, res) => {
  try {
    if (!(await canViewContentOf(req.auth, req.profile._id))) {
      return res.status(403).json({ error: 'This account is private' })
    }
    const isFollowers = direction === 'followers'
    const filter = isFollowers
      ? { following: req.profile._id, status: 'accepted' }
      : { follower: req.profile._id, status: 'accepted' }
    const follows = await Follow.find(filter).populate(isFollowers ? 'follower' : 'following', PUBLIC_FIELDS)
    return res.json(follows.map((f) => ({ followId: f._id, user: isFollowers ? f.follower : f.following, since: f.respondedAt })))
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

export default { request, incoming, outgoing, followByID, accept, remove, followers: listFor('followers'), following: listFor('following') }
