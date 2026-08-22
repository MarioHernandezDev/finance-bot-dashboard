const COOKIE_NAME = 'auth_token'

export default defineNuxtRouteMiddleware(async (to) => {
  const authToken = useCookie<string | null>(COOKIE_NAME)
  const isAuthenticated = useState('is-authenticated', () => false)

  if (import.meta.server) {
    const { createHmac } = await import('node:crypto')
    const config = useRuntimeConfig()
    const expectedToken = createHmac('sha256', config.systemPassword)
      .update('cryptobot-session')
      .digest('hex')

    isAuthenticated.value = authToken.value === expectedToken
  }

  if (!isAuthenticated.value && to.path !== '/login') {
    return navigateTo('/login')
  }

  if (isAuthenticated.value && to.path === '/login') {
    return navigateTo('/paper-trading')
  }
})