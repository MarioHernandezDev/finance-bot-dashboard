import { sendTelegramAlert } from '../utils/telegram'
import { binancePublicRequest, binanceSignedRequest } from '../utils/real-binance'

const HARD_LIMIT_USDT = 10

interface BinanceOrder {
  symbol: string
  side: string
  status: string
  executedQty: string
  cummulativeQuoteQty: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ action?: 'BUY' | 'SELL'; symbol?: string; amount?: number }>(event)
  const symbol = String(body?.symbol || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  const amount = Number(body?.amount)
  if (!/^[A-Z0-9]{5,15}USDT$/.test(symbol) || !['BUY', 'SELL'].includes(body?.action || '') || !Number.isFinite(amount) || amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Orden real inválida.' })
  }
  if (amount > HARD_LIMIT_USDT) throw createError({ statusCode: 400, statusMessage: 'El límite de seguridad por orden es 10.00 USDT.' })

  const order = await binanceSignedRequest<BinanceOrder>('POST', '/api/v3/order', {
    symbol,
    side: body.action,
    type: 'MARKET',
    quoteOrderQty: amount.toFixed(2)
  })
  const asset = symbol.replace(/USDT$/, '')
  const sideLabel = body.action === 'BUY' ? 'COMPRA' : 'VENTA'
  const message = `⚠️ TRADING REAL: ${sideLabel} de ${asset} por ${Number(order.cummulativeQuoteQty).toFixed(2)} USDT ejecutada.`
  await sendTelegramAlert(message)
  return { success: true, order, message }
})