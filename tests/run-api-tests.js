// Automated API test run:  npm run test:api
// 1. Connects to a SEPARATE test database ("Giftify_test") so your real data is untouched
// 2. Creates the admin account, starts the API on port 3100
// 3. Runs every request in Giftify_API.postman_collection.json with Newman
// 4. Deletes the test database and prints a summary
//
// Uses TEST_MONGODB_URI if set, otherwise your MONGODB_URI with the database name swapped.
import mongoose from 'mongoose'
import newman from 'newman'
import { fileURLToPath } from 'url'
import fs from 'fs'
import config from '../config/config.js'
import app from '../server/express.js'
import User from '../server/models/user.model.js'

const toTestDb = (uri) => {
  const u = new URL(uri)
  u.pathname = '/Giftify_test'
  return u.toString()
}
const testUri = process.env.TEST_MONGODB_URI || toTestDb(config.mongoUri)
const PORT = process.env.TEST_PORT || 3100
const here = (p) => fileURLToPath(new URL(p, import.meta.url))

const main = async () => {
  await mongoose.connect(testUri)
  console.log(`Test database: ${mongoose.connection.name}`)
  await mongoose.connection.dropDatabase()
  await User.syncIndexes()

  const admin = new User({ name: 'Giftify Admin', username: 'admin', email: 'admin@giftify.com', role: 'admin' })
  admin.password = 'Admin@123'
  await admin.save()

  const server = app.listen(PORT)
  fs.mkdirSync(here('./results'), { recursive: true })

  const summary = await new Promise((resolve, reject) =>
    newman.run(
      {
        collection: here('./Giftify_API.postman_collection.json'),
        envVar: [{ key: 'baseUrl', value: `http://localhost:${PORT}` }],
        reporters: ['cli', 'json'],
        reporter: { json: { export: here('./results/newman-results.json') } },
      },
      (err, s) => (err ? reject(err) : resolve(s))
    )
  )

  server.close()
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()

  const failures = summary.run.failures.length
  console.log(failures ? `\n${failures} test(s) FAILED` : '\nAll API tests passed.')
  process.exit(failures ? 1 : 0)
}

main().catch(async (err) => {
  console.error(err)
  await mongoose.disconnect()
  process.exit(1)
})
