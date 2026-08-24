import { SUPPORTED_ASSETS, type RiskLevel } from '~/types/crypto'
import { appendBotLog, getBotSettings } from './bot-state'
import { buyAsset, getPaperTradingState, sellAsset } from './paper-trading'
import { sendTelegramAlert } from './telegram'

const BINANCE_KLINES_URL = 'https://api3.binance.com/api/v3/klines'
const BETWEEN_ASSETS_DELAY_MS = 300
const ALERT_COOLDOWN_MS = 15 * 60 * 1000
const ALERT_SYMBOLS = new Set(['SOLUSDT', 'LINKUSDT', 'FETUSDT', 'PEPEUSDT'])
const lastAlertAt = new Map<string, number>()

export class BinanceRateLimitError extends Error {
  constructor(status: number) {
    super(`Binance rate limit: HTTP ${status}`)
    this.name = 'BinanceRateLimitError'
  }
}

const getHttpStatus = (error: unknown) => {
  if (!error || typeof error !== 'object') return undefined
  const responseStatus = 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response
    ? error.response.status
    : undefined
  const status = 'status' in error ? error.status : responseStatus
  return typeof status === 'number' ? status : undefined
}

const sendExtremeMarketAlert = async (symbol: string, rsi: number, latestPrice: number, drop15m: number) => {
  const isOversold = ALERT_SYMBOLS.has(symbol) && rsi <= 25
  const isRapidDrop = drop15m <= -5
  if (!isOversold && !isRapidDrop) return

  const alertKey = `${symbol}:${isOversold ? 'rsi' : ''}:${isRapidDrop ? 'drop' : ''}`
  const now = Date.now()
  if (now - (lastAlertAt.get(alertKey) || 0) < ALERT_COOLDOWN_MS) return

  const asset = SUPPORTED_ASSETS.find(item => item.symbol === symbol)
  const risk = asset?.risk === 'HIGH' ? 'Alto' : 'Medio'
  const suggestion = isOversold
    ? 'Posible compra en suelo por sobreventa extrema'
    : 'Posible toma de beneficios o revisión del riesgo'
  const reasons = [
    isOversold ? `RSI ${rsi.toFixed(1)}` : '',
    isRapidDrop ? `caída ${drop15m.toFixed(2)}% en 15 minutos` : ''
  ].filter(Boolean).join(' | ')
  const message = [
    '🚨 *ALERTA DE OPORTUNIDAD/RIESGO*',
    `*Moneda:* ${symbol.replace(/USDT$/, '')}`,
    `*RSI actual:* ${rsi.toFixed(1)} | *Precio:* $${latestPrice}`,
    `*Nivel de Riesgo:* ${risk}`,
    `*Sugerencia de acción manual:* ${suggestion}`,
    `*Señal detectada:* ${reasons}`,
    '*Advertencia:* Esta es una alerta de volatilidad. Realiza tu propio análisis antes de ejecutar la orden manual.'
  ].join('\n')

  lastAlertAt.set(alertKey, now)
  await sendTelegramAlert(message)
  await appendBotLog(`📨 Alerta de Telegram enviada para ${symbol.replace(/USDT$/, '')}: ${reasons}`)
}

export const evaluateMarket = async (symbol: string) => {
  try {
    const res = await $fetch<unknown[][]>(BINANCE_KLINES_URL, {
      query: { symbol, interval: '1m', limit: 30 },
      timeout: 5000
    })
    if (!res || res.length < 20) return

    const closePrices = res.map(kline => Number(kline[4])).filter(Number.isFinite)
    if (closePrices.length < 15) return
    const latestPrice = closePrices.at(-1)
    if (latestPrice === undefined) return

    const sma20 = closePrices.slice(-20).reduce((a, b) => a + b, 0) / Math.min(closePrices.length, 20)
    const gains: number[] = []
    const losses: number[] = []
    for (let i = closePrices.length - 14; i < closePrices.length; i++) {
      const currentClose = closePrices[i]
      const previousClose = closePrices[i - 1]
      if (currentClose === undefined || previousClose === undefined) continue
      const diff = currentClose - previousClose
      if (diff >= 0) gains.push(diff)
      else losses.push(Math.abs(diff))
    }
    const avgGain = gains.length ? gains.reduce((a, b) => a + b, 0) / 14 : 0
    const avgLoss = losses.length ? losses.reduce((a, b) => a + b, 0) / 14 : 1
    const rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss)
    const rsi = 100 - (100 / (1 + rs))
    const price15MinutesAgo = closePrices.at(-16)
    const drop15m = price15MinutesAgo ? ((latestPrice - price15MinutesAgo) / price15MinutesAgo) * 100 : 0

    const settings = await getBotSettings()
    const paperTrading = await getPaperTradingState()
    const assetName = symbol.replace(/USDT$/, '')
    const currentHolding = paperTrading.holdings[assetName] || 0
    await appendBotLog(`🔍 ${assetName}: RSI ${rsi.toFixed(1)} | $${latestPrice} | SMA20 $${sma20.toFixed(2)}`)
    await sendExtremeMarketAlert(symbol, rsi, latestPrice, drop15m)

    if (rsi <= settings.buyRsiThreshold && latestPrice > sma20 && currentHolding <= 0) {
      const assetInfo = SUPPORTED_ASSETS.find(asset => asset.symbol === symbol)
      const risk: RiskLevel = assetInfo?.risk || 'MEDIUM'
      const amountUSDT = paperTrading.usdtBalance * ((settings.riskAllocation[risk] || 0) / 100)
      if (amountUSDT >= 1) {
        await appendBotLog(`⚡ Ejecutando COMPRA ${assetName} por $${amountUSDT.toFixed(2)}...`)
        const result = await buyAsset(symbol, latestPrice, amountUSDT)
        await appendBotLog(`${result.success ? '✅' : '❌'} ${result.message}`)
      } else await appendBotLog(`⚠️ Saldo insuficiente para comprar ${assetName}.`)
    } else if (rsi >= settings.sellRsiThreshold && currentHolding > 0) {
      await appendBotLog(`⚡ Ejecutando VENTA ${assetName}...`)
      const result = await sellAsset(symbol, latestPrice)
      await appendBotLog(`${result.success ? '✅' : '❌'} ${result.message}`)
    }
  } catch (error: unknown) {
    const status = getHttpStatus(error)
    if (status === 429 || status === 418) {
      await appendBotLog(`⚠️ Binance respondió HTTP ${status} (rate limit). El bot esperará 60 segundos antes del siguiente ciclo.`)
      throw new BinanceRateLimitError(status)
    }
    const message = error instanceof Error ? error.message : 'Error de red'
    await appendBotLog(`❌ Error en ${symbol}: ${message}`)
  }
}

export const scanAllMarkets = async () => {
  for (const [index, asset] of SUPPORTED_ASSETS.entries()) {
    if (index > 0) await new Promise(resolve => setTimeout(resolve, BETWEEN_ASSETS_DELAY_MS))
    await evaluateMarket(asset.symbol)
  }
}