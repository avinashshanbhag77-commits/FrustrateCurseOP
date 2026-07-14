import { Redis } from '@upstash/redis'

const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN

if (!url || !token) {
  console.warn('Upstash Redis REST URL or TOKEN not set. Redis client will not be available.')
}

export const redis = new Redis({ url, token })

export async function pingRedis() {
  try {
    const res = await redis.ping()
    return res === 'PONG'
  } catch (err) {
    return false
  }
}
