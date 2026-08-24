import { buyAsset, sellAsset } from '../utils/paper-trading'
import { getBotState } from '../utils/bot-state'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ action?: 'BUY' | 'SELL'; symbol?: string; price?: number; amount?: number; percentage?: number }>(event)
  if (!body?.symbol || !Number.isFinite(body.price) || !body.action) throw createError({ statusCode: 400, message: 'Operación inválida.' })
  const result = body.action === 'BUY'
    ? await buyAsset(body.symbol, body.price, body.amount || 0)
    : await sellAsset(body.symbol, body.price, body.percentage)
  return { result, paperTrading: (await getBotState()).paperTrading }
})