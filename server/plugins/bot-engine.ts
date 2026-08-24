import { getBotSettings } from '../utils/bot-state'
import { scanAllMarkets } from '../utils/bot-engine'

const SCAN_INTERVAL_MS = 10000

export default defineNitroPlugin(() => {
  const run = async (): Promise<void> => {
    try {
      if ((await getBotSettings()).isActive) await scanAllMarkets()
    } catch (error) {
      console.error('Error en el ciclo global del bot:', error)
    } finally {
      setTimeout(() => void run(), SCAN_INTERVAL_MS)
    }
  }
  void run()
})