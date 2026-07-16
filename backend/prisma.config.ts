import { defineConfig } from '@prisma/internals'
import * as dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  datasourceUrl: process.env.DATABASE_URL,
})
