import mongoose from 'mongoose'
import crypto from 'crypto'

// Collection: users
// Every account is PRIVATE: anyone signed in can see the basic profile (name, username,
// bio, avatar) so they can send a follow request, but wish lists are only visible to
// followers the user has approved.
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: 'Name is required' },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: 'Username is required',
      match: [/^[a-z0-9_.]{3,30}$/, 'Username must be 3-30 characters: letters, numbers, _ or .'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      match: [/.+\@.+\..+/, 'Please fill a valid email address'],
      required: 'Email is required',
    },
    bio: { type: String, trim: true, maxlength: [280, 'Bio must be 280 characters or less'] },
    avatarUrl: { type: String, trim: true },
    birthday: { type: Date },
    // "user" for everyone who signs up; "admin" is created by the seed script
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    // The plain-text password is never stored - only its salted hash
    hashed_password: { type: String, required: 'Password is required' },
    salt: String,
  },
  { timestamps: { createdAt: 'created', updatedAt: 'updated' } }
)

// "password" is a virtual field: setting it generates a salt and stores the hash
UserSchema.virtual('password')
  .set(function (password) {
    this._password = password
    this.salt = this.makeSalt()
    this.hashed_password = this.encryptPassword(password)
  })
  .get(function () {
    return this._password
  })

UserSchema.path('hashed_password').validate(function () {
  if (this._password && this._password.length < 6) {
    this.invalidate('password', 'Password must be at least 6 characters.')
  }
  if (this.isNew && !this._password) {
    this.invalidate('password', 'Password is required')
  }
}, null)

UserSchema.methods = {
  authenticate(plainText) {
    return this.encryptPassword(plainText) === this.hashed_password
  },
  encryptPassword(password) {
    if (!password) return ''
    try {
      return crypto.createHmac('sha256', this.salt).update(password).digest('hex')
    } catch (err) {
      return ''
    }
  },
  makeSalt() {
    return crypto.randomBytes(16).toString('hex')
  },
}

// Never send the password hash or salt back in an API response
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.hashed_password
    delete ret.salt
    delete ret.__v
    return ret
  },
})

export default mongoose.model('User', UserSchema)
