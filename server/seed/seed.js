// Seed script: creates the admin account, plus demo data with "--demo".
//   npm run seed            -> admin only
//   npm run seed -- --demo  -> admin + 3 demo users, follows, wish lists and items
import mongoose from 'mongoose'
import config from '../../config/config.js'
import User from '../models/user.model.js'
import Follow from '../models/follow.model.js'
import Wishlist from '../models/wishlist.model.js'
import Item from '../models/item.model.js'

const upsertUser = async ({ password, ...fields }) => {
  let user = await User.findOne({ email: fields.email })
  if (!user) user = new User(fields)
  else Object.assign(user, fields)
  user.password = password
  await user.save()
  return user
}

const run = async () => {
  await mongoose.connect(config.mongoUri)
  console.log('Connected to', mongoose.connection.name)

  const admin = await upsertUser({
    name: process.env.ADMIN_NAME || 'Giftify Admin',
    username: process.env.ADMIN_USERNAME || 'admin',
    email: process.env.ADMIN_EMAIL || 'admin@giftify.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
    role: 'admin',
  })
  console.log('Admin ready:', admin.email)

  if (process.argv.includes('--demo')) {
    const [ava, ben, cleo] = await Promise.all([
      upsertUser({ name: 'Ava Chen', username: 'ava', email: 'ava@example.com', password: 'Password1', bio: 'Coffee, books and plants.', birthday: '1999-03-14' }),
      upsertUser({ name: 'Ben Okafor', username: 'ben', email: 'ben@example.com', password: 'Password1', bio: 'Runner and amateur chef.' }),
      upsertUser({ name: 'Cleo Martin', username: 'cleo', email: 'cleo@example.com', password: 'Password1' }),
    ])
    const ids = [ava._id, ben._id, cleo._id]
    await Follow.deleteMany({ $or: [{ follower: { $in: ids } }, { following: { $in: ids } }] })
    await Item.deleteMany({ owner: { $in: ids } })
    await Wishlist.deleteMany({ owner: { $in: ids } })

    // Ben follows Ava (approved); Cleo has requested to follow Ava (pending)
    await Follow.create({ follower: ben._id, following: ava._id, status: 'accepted', respondedAt: new Date() })
    await Follow.create({ follower: cleo._id, following: ava._id, status: 'pending' })

    const bday = await Wishlist.create({ owner: ava._id, title: 'Birthday 2027', occasion: 'birthday', eventDate: '2027-03-14', description: 'Turning 28!' })
    const xmas = await Wishlist.create({ owner: ava._id, title: 'Christmas', occasion: 'christmas', eventDate: '2026-12-25' })
    await Item.create([
      { wishlist: bday._id, owner: ava._id, name: 'Kindle Paperwhite', price: 239, priority: 'high', url: 'https://example.com/kindle' },
      { wishlist: bday._id, owner: ava._id, name: 'Monstera plant (large)', price: 60, priority: 'medium' },
      { wishlist: bday._id, owner: ava._id, name: 'Pour-over coffee set', price: 45, priority: 'low', claimedBy: ben._id, claimedAt: new Date() },
      { wishlist: xmas._id, owner: ava._id, name: 'Wool scarf', price: 35, priority: 'medium', notes: 'Grey or navy' },
    ])
    await Wishlist.create({ owner: ben._id, title: 'Running gear', occasion: 'other' })
    console.log('Demo data created. Demo logins: ava / ben / cleo @example.com, password "Password1"')
  }

  await mongoose.disconnect()
}

run().catch(async (err) => {
  console.error('Seed failed:', err.message)
  await mongoose.disconnect()
  process.exit(1)
})
