import express from 'express'
import cookieParser from 'cookie-parser'
import compress from 'compression'
import cors from 'cors'
import helmet from 'helmet'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import followRoutes from './routes/follow.routes.js'
import wishlistRoutes from './routes/wishlist.routes.js'
import itemRoutes from './routes/item.routes.js'

const app = express()

// Middleware is registered BEFORE the routes so every request body is parsed
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(compress())
app.use(helmet())
app.use(cors())

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Giftify API.' })
})

// API routes
app.use('/', authRoutes)
app.use('/', userRoutes)
app.use('/', followRoutes)
app.use('/', wishlistRoutes)
app.use('/', itemRoutes)

// Unknown route
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Catch JWT errors (missing / invalid token) and any other errors, return clean JSON
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: err.name + ': ' + err.message })
  }
  console.log(err)
  return res.status(400).json({ error: err.name + ': ' + err.message })
})

export default app
