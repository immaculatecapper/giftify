import mongoose from 'mongoose'

export const OCCASIONS = ['birthday', 'christmas', 'wedding', 'baby_shower', 'graduation', 'anniversary', 'housewarming', 'other']

// Collection: wishlists
// A user can have many wish lists, e.g. "Birthday 2026" or "Christmas".
const WishlistSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    title: { type: String, trim: true, required: 'Title is required', maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500 },
    occasion: { type: String, enum: { values: OCCASIONS, message: 'Invalid occasion' }, default: 'other' },
    eventDate: Date,
  },
  { timestamps: { createdAt: 'created', updatedAt: 'updated' } }
)

WishlistSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v
    return ret
  },
})

export default mongoose.model('Wishlist', WishlistSchema)
