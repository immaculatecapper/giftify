import express from 'express'
import itemCtrl from '../controllers/item.controller.js'
import authCtrl from '../controllers/auth.controller.js'

const router = express.Router()

router.route('/api/items/:itemId')
  .get(authCtrl.requireSignin, itemCtrl.read)
  .put(authCtrl.requireSignin, itemCtrl.isItemOwner, itemCtrl.update)
  .delete(authCtrl.requireSignin, itemCtrl.remove) // owner, or the claimer once the gift is given

// Claiming a gift (hidden from the list owner)
router.route('/api/items/:itemId/claim')
  .post(authCtrl.requireSignin, itemCtrl.claim)
  .delete(authCtrl.requireSignin, itemCtrl.unclaim)

// Gifts I've claimed for other people
router.route('/api/claims').get(authCtrl.requireSignin, itemCtrl.myClaims)

// itemByID checks privacy with req.auth, so make sure the token is verified first
router.param('itemId', (req, res, next, id) =>
  authCtrl.requireSignin(req, res, (err) => (err ? next(err) : itemCtrl.itemByID(req, res, next, id))))

export default router
