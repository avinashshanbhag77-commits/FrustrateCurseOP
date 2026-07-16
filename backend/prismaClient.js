import { PrismaClient } from './prisma/.prisma/client/index.js'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
})

export default prisma
