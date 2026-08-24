import { getBotSettings } from '../utils/bot-state'
import { BinanceRateLimitError, scanAllMarkets } from '../utils/bot-engine'

const SCAN_INTERVAL_MS = 30000
const RATE_LIMIT_BACKOFF_MS = 60000

export default defineNitroPlugin(() => {
  const run = async (): Promise<void> => {
    let nextDelay = SCAN_INTERVAL_MS
    try {
      if ((await getBotSettings()).isActive) await scanAllMarkets()
    } catch (error) {
      if (error instanceof BinanceRateLimitError) {
        nextDelay = RATE_LIMIT_BACKOFF_MS
        console.warn(`Rate limit de Binance detectado. Próximo escaneo en ${RATE_LIMIT_BACKOFF_MS / 1000} segundos.`)
      } else {
        console.error('Error en el ciclo global del bot:', error)
      }
    } finally {
      setTimeout(() => void run(), nextDelay)
    }
  }
  void run()
})