import express from 'express'
import wishlistCtrl from '../controllers/wishlist.controller.js'
import itemCtrl from '../controllers/item.controller.js'
import userCtrl from '../controllers/user.controller.js'
import authCtrl from '../controllers/auth.controller.js'

const router = express.Router()

// My wish lists
router.route('/api/wishlists')
  .get(authCtrl.requireSignin, wishlistCtrl.listMine)
  .post(authCtrl.requireSignin, wishlistCtrl.create)

// A single wish list - followers can read, only the owner can change
router.route('/api/wishlists/:wishlistId')
  .get(authCtrl.requireSignin, wishlistCtrl.canView, wishlistCtrl.read)
  .put(authCtrl.requireSignin, wishlistCtrl.isOwner, wishlistCtrl.update)
  .delete(authCtrl.requireSignin, wishlistCtrl.isOwner, wishlistCtrl.remove)

// Items on a wish list
router.route('/api/wishlists/:wishlistId/items')
  .get(authCtrl.requireSignin, wishlistCtrl.canView, itemCtrl.listByWishlist)
  .post(authCtrl.requireSignin, wishlistCtrl.isOwner, itemCtrl.create)

// Another user's wish lists (approved followers only)
router.route('/api/users/:userId/wishlists').get(authCtrl.requireSignin, wishlistCtrl.listByUser)

// requireSignin must run before the param loaders, because they use req.auth
router.param('wishlistId', (req, res, next, id) =>
  authCtrl.requireSignin(req, res, (err) => (err ? next(err) : wishlistCtrl.wishlistByID(req, res, next, id))))
router.param('userId', userCtrl.userByID)

export default router
