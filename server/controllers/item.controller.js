import Item from '../models/item.model.js'
import errorHandler from '../helpers/dbErrorHandler.js'
import { isSelf, isAdmin, canViewContentOf } from '../helpers/access.js'

// Fields the list owner can set. Claim fields are NOT here - only the claim routes change them.
const EDITABLE = ['name', 'url', 'imageUrl', 'price', 'priority', 'notes']

const pick = (obj, keys) =>
  keys.reduce((out, k) => (obj[k] !== undefined ? { ...out, [k]: obj[k] } : out), {})

// KEY PRIVACY RULE: shape an item for whoever is looking at it.
// - The OWNER never sees whether an item is claimed (keeps the gift a surprise).
// - Followers see "isClaimed" so they don't buy the same gift, and "claimedByMe"
//   so they know which ones they are getting. They don't see WHO else claimed it.
const toView = (item, auth) => {
  const obj = item.toObject ? item.toObject() : { ...item }
  const claimedBy = obj.claimedBy && (obj.claimedBy._id || obj.claimedBy)
  const ownerId = obj.owner && (obj.owner._id || obj.owner)
  delete obj.claimedBy
  delete obj.claimedAt
  delete obj.__v
  if (!isSelf(auth, ownerId)) {
    obj.isClaimed = !!claimedBy
    obj.claimedByMe = !!claimedBy && isSelf(auth, claimedBy)
  }
  return obj
}

// POST /api/wishlists/:wishlistId/items - owner adds an item (wishlist.isOwner runs first)
const create = async (req, res) => {
  try {
    const item = await Item.create({
      ...pick(req.body, EDITABLE),
      wishlist: req.wishlist._id,
      owner: req.wishlist.owner._id,
    })
    return res.status(201).json(toView(item, req.auth))
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

// GET /api/wishlists/:wishlistId/items - items on a list (wishlist.canView runs first)
const listByWishlist = async (req, res) => {
  try {
    const order = { high: 0, medium: 1, low: 2 }
    const items = await Item.find({ wishlist: req.wishlist._id }).sort({ created: 1 })
    items.sort((a, b) => order[a.priority] - order[b.priority])
    return res.json(items.map((i) => toView(i, req.auth)))
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

// router.param - loads the item and checks the viewer is allowed to see it
const itemByID = async (req, res, next, id) => {
  try {
    const item = await Item.findById(id)
    if (!item) return res.status(404).json({ error: 'Item not found' })
    if (!(await canViewContentOf(req.auth, item.owner))) {
      return res.status(403).json({ error: 'This account is private' })
    }
    req.item = item
    next()
  } catch (err) {
    return res.status(400).json({ error: 'Could not retrieve item' })
  }
}

const isItemOwner = (req, res, next) => {
  if (!isSelf(req.auth, req.item.owner) && !isAdmin(req.auth)) {
    return res.status(403).json({ error: 'Only the list owner can edit this item' })
  }
  next()
}

// GET /api/items/:itemId
const read = (req, res) => res.json(toView(req.item, req.auth))

// PUT /api/items/:itemId - owner edits item details
const update = async (req, res) => {
  try {
    Object.assign(req.item, pick(req.body, EDITABLE))
    await req.item.save()
    return res.json(toView(req.item, req.auth))
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

// DELETE /api/items/:itemId
// - The owner can delete any of their items (e.g. after receiving a gift).
// - The person who claimed it can also remove it once the gift has been given.
const remove = async (req, res) => {
  try {
    const owner = isSelf(req.auth, req.item.owner)
    const claimer = req.item.claimedBy && isSelf(req.auth, req.item.claimedBy)
    if (!owner && !claimer && !isAdmin(req.auth)) {
      return res.status(403).json({ error: 'Only the owner or the person who claimed this gift can remove it' })
    }
    await req.item.deleteOne()
    return res.json({ message: claimer && !owner ? 'Gift marked as given and removed from the list' : 'Item deleted', _id: req.item._id })
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

// POST /api/items/:itemId/claim - an approved follower says "I'm getting this"
const claim = async (req, res) => {
  try {
    if (isSelf(req.auth, req.item.owner)) {
      return res.status(400).json({ error: "You can't claim items on your own list" })
    }
    // Atomic update so two people can't claim the same item at the same time
    const item = await Item.findOneAndUpdate(
      { _id: req.item._id, claimedBy: null },
      { claimedBy: req.auth._id, claimedAt: new Date() },
      { new: true }
    )
    if (!item) return res.status(409).json({ error: 'Someone has already claimed this item' })
    return res.json({ message: 'Item claimed', item: toView(item, req.auth) })
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

// DELETE /api/items/:itemId/claim - the claimer changes their mind
const unclaim = async (req, res) => {
  try {
    if (!req.item.claimedBy || !isSelf(req.auth, req.item.claimedBy)) {
      return res.status(403).json({ error: 'You have not claimed this item' })
    }
    req.item.claimedBy = null
    req.item.claimedAt = null
    await req.item.save()
    return res.json({ message: 'Claim removed', item: toView(req.item, req.auth) })
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

// GET /api/claims - the gifts I've claimed for other people ("my shopping list")
const myClaims = async (req, res) => {
  try {
    const items = await Item.find({ claimedBy: req.auth._id })
      .populate('owner', 'name username avatarUrl')
      .populate('wishlist', 'title occasion eventDate')
      .sort({ claimedAt: -1 })
    return res.json(items.map((i) => toView(i, req.auth)))
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

export default { create, listByWishlist, itemByID, isItemOwner, read, update, remove, claim, unclaim, myClaims }
