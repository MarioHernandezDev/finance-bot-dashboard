import { createHmac } from 'node:crypto'

const COOKIE_NAME = 'auth_token'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7

const createSessionToken = (password: string) => {
  return createHmac('sha256', password).update('cryptobot-session').digest('hex')
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ password?: string }>(event)
  const config = useRuntimeConfig(event)

  if (!body?.password || body.password !== config.systemPassword) {
    throw createError({ statusCode: 401, message: 'Contraseña incorrecta' })
  }

  setCookie(event, COOKIE_NAME, createSessionToken(config.systemPassword), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE,
    path: '/'
  })

  return { success: true }
})