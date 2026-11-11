import config from './config/config.js'
import app from './server/express.js'
import mongoose from 'mongoose'

// Connect to MongoDB (Atlas or local), then start the Express server
mongoose
  .connect(config.mongoUri)
  .then(() => console.log('Connected to the database!'))
  .catch((err) => console.error(`Unable to connect to database: ${err.message}`))

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err.message}`)
})

app.listen(config.port, (err) => {
  if (err) console.log(err)
  console.info('Giftify API started on port %s.', config.port)
})
