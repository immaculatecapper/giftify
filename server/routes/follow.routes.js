import express from 'express'
import followCtrl from '../controllers/follow.controller.js'
import userCtrl from '../controllers/user.controller.js'
import authCtrl from '../controllers/auth.controller.js'

const router = express.Router()

router.route('/api/follows').post(authCtrl.requireSignin, followCtrl.request)        // send request
router.route('/api/follows/requests').get(authCtrl.requireSignin, followCtrl.incoming) // requests to me
router.route('/api/follows/sent').get(authCtrl.requireSignin, followCtrl.outgoing)     // requests I sent
router.route('/api/follows/:followId/accept').put(authCtrl.requireSignin, followCtrl.accept)
router.route('/api/follows/:followId').delete(authCtrl.requireSignin, followCtrl.remove) // decline / unfollow

router.route('/api/users/:userId/followers').get(authCtrl.requireSignin, followCtrl.followers)
router.route('/api/users/:userId/following').get(authCtrl.requireSignin, followCtrl.following)

router.param('followId', followCtrl.followByID)
router.param('userId', userCtrl.userByID)

export default router
