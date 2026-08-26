import { getBotState, updateBotSettings } from '../../utils/bot-state'
import type { RiskLevel } from '~/types/crypto'

export default defineEventHandler(async (event) => {
  try {
    if (getMethod(event) === 'GET') return await getBotState()

    const body = await readBody<{
      isActive?: boolean
      buyRsiThreshold?: number
      sellRsiThreshold?: number
      riskAllocation?: Record<RiskLevel, number>
    }>(event)
    const changes = Object.fromEntries(Object.entries(body || {}).filter(([, value]) => value !== undefined))
    const updatedSettings = await updateBotSettings(changes)
    return { ...updatedSettings, paperTrading: (await getBotState()).paperTrading }
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : 'Error desconocido al guardar el estado del bot.'
    console.error('[POST /api/bot/state] Error de escritura en Supabase:', detail)
    setResponseStatus(event, 500)
    return { success: false, error: detail }
  }
})