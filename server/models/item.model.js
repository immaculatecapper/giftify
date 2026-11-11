import mongoose from 'mongoose'

// Collection: items
// A gift idea on a wish list. A follower can "claim" an item so other gift-givers
// know it's taken. The list OWNER never sees claim info, so the gift stays a surprise
// (see item.controller.js -> toView).
const ItemSchema = new mongoose.Schema(
  {
    wishlist: { type: mongoose.Schema.ObjectId, ref: 'Wishlist', required: true },
    owner: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    name: { type: String, trim: true, required: 'Item name is required', maxlength: 150 },
    url: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    price: { type: Number, min: [0, 'Price cannot be negative'] },
    priority: { type: String, enum: { values: ['low', 'medium', 'high'], message: 'Priority must be low, medium or high' }, default: 'medium' },
    notes: { type: String, trim: true, maxlength: 500 },
    // Claim (hidden from the owner)
    claimedBy: { type: mongoose.Schema.ObjectId, ref: 'User', default: null },
    claimedAt: Date,
  },
  { timestamps: { createdAt: 'created', updatedAt: 'updated' } }
)

export default mongoose.model('Item', ItemSchema)
