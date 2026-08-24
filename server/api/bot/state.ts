import { getBotState, updateBotSettings } from '../../utils/bot-state'
import type { RiskLevel } from '~/types/crypto'

export default defineEventHandler(async (event) => {
  if (getMethod(event) === 'GET') return getBotState()

  const body = await readBody<{
    isActive?: boolean
    buyRsiThreshold?: number
    sellRsiThreshold?: number
    riskAllocation?: Record<RiskLevel, number>
  }>(event)
  const changes = Object.fromEntries(Object.entries(body || {}).filter(([, value]) => value !== undefined))
  return { ...(await updateBotSettings(changes)), paperTrading: (await getBotState()).paperTrading }
})