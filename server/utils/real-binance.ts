import { createHmac } from 'node:crypto'

const BINANCE_API_URL = 'https://api.binance.com'

interface BinanceCredentials {
  apiKey: string
  secretKey: string
  enabled: boolean
}

const getCredentials = (): BinanceCredentials => {
  const config = useRuntimeConfig()
  return {
    apiKey: String(config.binanceApiKey || '').trim(),
    secretKey: String(config.binanceSecretKey || '').trim(),
    enabled: config.enableRealTrading === true
  }
}

export const getRealTradingStatus = () => {
  const { apiKey, secretKey, enabled } = getCredentials()
  return { configured: Boolean(apiKey && secretKey), enabled: enabled && Boolean(apiKey && secretKey) }
}

const requireCredentials = () => {
  const credentials = getCredentials()
  if (!credentials.apiKey || !credentials.secretKey) throw createError({ statusCode: 503, statusMessage: 'Configura BINANCE_API_KEY y BINANCE_SECRET_KEY en el servidor.' })
  if (!credentials.enabled) throw createError({ statusCode: 403, statusMessage: 'Trading real desactivado. Activa ENABLE_REAL_TRADING=true en el servidor.' })
  return credentials
}

export const binanceSignedRequest = async <T>(method: 'GET' | 'POST', path: string, parameters: Record<string, string | number> = {}) => {
  const { apiKey, secretKey } = requireCredentials()
  const query = new URLSearchParams({
    ...Object.fromEntries(Object.entries(parameters).map(([key, value]) => [key, String(value)])),
    timestamp: String(Date.now()),
    recvWindow: '5000'
  })
  const signature = createHmac('sha256', secretKey).update(query.toString()).digest('hex')
  const url = `${BINANCE_API_URL}${path}?${query.toString()}&signature=${signature}`
  return await $fetch<T>(url, { method, headers: { 'X-MBX-APIKEY': apiKey }, timeout: 10000 })
}

export const binancePublicRequest = async <T>(path: string, parameters: Record<string, string> = {}) => {
  const query = new URLSearchParams(parameters).toString()
  return await $fetch<T>(`${BINANCE_API_URL}${path}${query ? `?${query}` : ''}`, { timeout: 10000 })
}