import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

// Always load the .env file from the project root, wherever the server is started from
dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) })

// Central app configuration. Real values live in .env (see .env.example)
const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'YOUR_secret_key',
  mongoUri:
    process.env.MONGODB_URI ||
    'mongodb://' + (process.env.IP || 'localhost') + ':' + (process.env.MONGO_PORT || '27017') + '/Giftify',
}

export default config
