import { scanAllMarkets } from '../../utils/bot-engine'
import { getBotSettings } from '../../utils/bot-state'

export default defineEventHandler(async () => {
  const settings = await getBotSettings()
  if (!settings.isActive) return { scanned: false, reason: 'Bot inactivo' }
  await scanAllMarkets()
  return { scanned: true }
})