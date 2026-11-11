import mongoose from 'mongoose'

// Collection: follows
// One document per follow relationship. A new follow starts as "pending" and only
// becomes "accepted" when the person being followed approves it.
const FollowSchema = new mongoose.Schema(
  {
    follower: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    following: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
    respondedAt: Date,
  },
  { timestamps: { createdAt: 'created', updatedAt: 'updated' } }
)

// A user can only have one follow (or request) per person
FollowSchema.index({ follower: 1, following: 1 }, { unique: true })

export default mongoose.model('Follow', FollowSchema)
