import Follow from '../models/follow.model.js'

// Privacy rules used by the wish list and item controllers.
// A user's wish lists can be seen by: the owner, an admin, or an APPROVED follower.

export const isSelf = (auth, userId) => !!auth && String(auth._id) === String(userId)

export const isAdmin = (auth) => !!auth && auth.role === 'admin'

export const isApprovedFollower = async (viewerId, ownerId) => {
  const follow = await Follow.exists({ follower: viewerId, following: ownerId, status: 'accepted' })
  return !!follow
}

export const canViewContentOf = async (auth, ownerId) => {
  if (isSelf(auth, ownerId) || isAdmin(auth)) return true
  return isApprovedFollower(auth._id, ownerId)
}
