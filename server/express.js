import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
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
app.use(compress()) // gzip every response (performance)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        // users paste product / avatar image links from any shop, so allow https images
        'img-src': ["'self'", 'data:', 'https:'],
      },
    },
  })
)
app.use(cors())

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the Giftify API.' })
})

// API routes
app.use('/', authRoutes)
app.use('/', userRoutes)
app.use('/', followRoutes)
app.use('/', wishlistRoutes)
app.use('/', itemRoutes)

// Unknown API route -> JSON 404
app.use(['/api', '/auth'], (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// React front end (production build in client/dist). One service serves both the API and the UI.
const dist = fileURLToPath(new URL('../client/dist', import.meta.url))
if (fs.existsSync(path.join(dist, 'index.html'))) {
  // Hashed files in /assets never change, so browsers can cache them for a year
  app.use('/assets', express.static(path.join(dist, 'assets'), { immutable: true, maxAge: '1y' }))
  app.use(express.static(dist, { maxAge: '1h' }))
  // Any other GET is a React Router page: send index.html
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')))
} else {
  app.get('/', (req, res) => res.json({ message: 'Welcome to the Giftify API.' }))
}

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
