import Wishlist from '../models/wishlist.model.js'
import Item from '../models/item.model.js'
import errorHandler from '../helpers/dbErrorHandler.js'
import { isSelf, isAdmin, canViewContentOf } from '../helpers/access.js'

const EDITABLE = ['title', 'description', 'occasion', 'eventDate']

const pick = (obj, keys) =>
  keys.reduce((out, k) => (obj[k] !== undefined ? { ...out, [k]: obj[k] } : out), {})

// Adds an itemCount to each wish list
const withCounts = async (lists) => {
  const counts = await Item.aggregate([
    { $match: { wishlist: { $in: lists.map((l) => l._id) } } },
    { $group: { _id: '$wishlist', count: { $sum: 1 } } },
  ])
  const byId = Object.fromEntries(counts.map((c) => [String(c._id), c.count]))
  return lists.map((l) => ({ ...l.toJSON(), itemCount: byId[String(l._id)] || 0 }))
}

// POST /api/wishlists - create a wish list for the signed-in user
const create = async (req, res) => {
  try {
    const list = await Wishlist.create({ ...pick(req.body, EDITABLE), owner: req.auth._id })
    return res.status(201).json(list)
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

// GET /api/wishlists - my own wish lists
const listMine = async (req, res) => {
  try {
    const lists = await Wishlist.find({ owner: req.auth._id }).sort({ eventDate: 1, created: -1 })
    return res.json(await withCounts(lists))
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

// GET /api/users/:userId/wishlists - someone else's lists (approved followers only)
const listByUser = async (req, res) => {
  try {
    if (!(await canViewContentOf(req.auth, req.profile._id))) {
      return res.status(403).json({ error: 'This account is private. Follow and get approved to see their wish lists.' })
    }
    const lists = await Wishlist.find({ owner: req.profile._id }).sort({ eventDate: 1, created: -1 })
    return res.json(await withCounts(lists))
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

// router.param - loads the wish list for any route with :wishlistId
const wishlistByID = async (req, res, next, id) => {
  try {
    const list = await Wishlist.findById(id).populate('owner', 'name username avatarUrl')
    if (!list) return res.status(404).json({ error: 'Wish list not found' })
    req.wishlist = list
    next()
  } catch (err) {
    return res.status(400).json({ error: 'Could not retrieve wish list' })
  }
}

// Middleware: viewer must be allowed to see this list (owner, approved follower, admin)
const canView = async (req, res, next) => {
  if (!(await canViewContentOf(req.auth, req.wishlist.owner._id))) {
    return res.status(403).json({ error: 'This account is private' })
  }
  next()
}

// Middleware: only the owner (or admin) can change the list or its items
const isOwner = (req, res, next) => {
  if (!isSelf(req.auth, req.wishlist.owner._id) && !isAdmin(req.auth)) {
    return res.status(403).json({ error: 'Only the owner can change this wish list' })
  }
  next()
}

// GET /api/wishlists/:wishlistId
const read = async (req, res) => {
  const [withCount] = await withCounts([req.wishlist])
  return res.json(withCount)
}

// PUT /api/wishlists/:wishlistId
const update = async (req, res) => {
  try {
    Object.assign(req.wishlist, pick(req.body, EDITABLE))
    await req.wishlist.save()
    return res.json(req.wishlist)
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

// DELETE /api/wishlists/:wishlistId - also deletes the list's items
const remove = async (req, res) => {
  try {
    await Item.deleteMany({ wishlist: req.wishlist._id })
    await req.wishlist.deleteOne()
    return res.json({ message: 'Wish list deleted', wishlist: req.wishlist })
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

export default { create, listMine, listByUser, wishlistByID, canView, isOwner, read, update, remove }
