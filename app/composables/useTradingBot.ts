// composables/useTradingBot.ts
import { SUPPORTED_ASSETS, type RiskLevel } from '~/types/crypto'

export const useTradingBot = () => {
  const isBotActive = useState('trading_bot_active', () => false)
  const botLogs = useState<string[]>('trading_bot_logs', () => [])
  const buyRsiThreshold = useState('trading_bot_buy_rsi', () => 35) // Ajustado a valor real
  const sellRsiThreshold = useState('trading_bot_sell_rsi', () => 65) // Ajustado a valor real
  const riskAllocation = useState<Record<RiskLevel, number>>('trading_bot_risk_allocation', () => ({
    LOW: 50,
    MEDIUM: 25,
    HIGH: 10
  }))
  const paperTrading = usePaperTrading()

  const logMessage = (msg: string) => {
    const time = new Date().toLocaleTimeString()
    botLogs.value.unshift(`[${time}] ${msg}`)
  }

  const toggleBot = () => {
    isBotActive.value = !isBotActive.value
    logMessage(isBotActive.value ? '🤖 Bot de Trading Activado' : '🛑 Bot de Trading Desactivado')
  }

  const evaluateMarket = async (symbol: string) => {
    try {
      const res = await $fetch<unknown[][]>(
        `https://data-api.binance.vision/api/v3/klines?symbol=${symbol}&interval=1m&limit=30`,
        { timeout: 5000 }
      )

      if (!res || res.length < 20) return

      const closePrices = res.map(kline => Number(kline[4])).filter(Number.isFinite)
      if (closePrices.length < 15) return
      const latestPrice = closePrices.at(-1)
      if (latestPrice === undefined) return

      // Cálculo de SMA 20 (Filtro de tendencia)
      const sma20 = closePrices.slice(-20).reduce((a, b) => a + b, 0) / Math.min(closePrices.length, 20)

      // Cálculo RSI 14
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

      const assetName = symbol.replace(/USDT$/, '')
      const usdtAvailable = paperTrading.usdtBalance.value
      const currentHolding = paperTrading.holdings.value[assetName] || 0

      logMessage(`🔍 ${assetName}: RSI ${rsi.toFixed(1)} | $${latestPrice} | SMA20 $${sma20.toFixed(2)}`)

      // Lógica de COMPRA (RSI Bajo + Tendencia Confirmada por encima de SMA20)
      if (rsi <= buyRsiThreshold.value && latestPrice > sma20 && currentHolding <= 0) {
        const assetInfo = SUPPORTED_ASSETS.find(a => a.symbol === symbol)
        const risk: RiskLevel = assetInfo ? assetInfo.risk : 'MEDIUM'
        const pctToUse = riskAllocation.value[risk]
        const amountUSDT = (usdtAvailable * (pctToUse / 100))

        if (amountUSDT >= 1) {
          logMessage(`⚡ Ejecutando COMPRA ${assetName} por $${amountUSDT.toFixed(2)}...`)
          const result = paperTrading.buyAsset(symbol, latestPrice, amountUSDT)
          logMessage(`${result.success ? '✅' : '❌'} ${result.message}`)
        } else {
          logMessage(`⚠️ Saldo insuficiente para comprar ${assetName}.`)
        }
      } else if (rsi >= sellRsiThreshold.value) {
        if (currentHolding > 0) {
          logMessage(`⚡ Ejecutando VENTA ${assetName}...`)
          const result = paperTrading.sellAsset(symbol, latestPrice)
          logMessage(`${result.success ? '✅' : '❌'} ${result.message}`)
        }
      }

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error de red'
      logMessage(`❌ Error en ${symbol}: ${message}`)
    }
  }

  return {
    isBotActive,
    botLogs,
    buyRsiThreshold,
    sellRsiThreshold,
    riskAllocation,
    toggleBot,
    evaluateMarket
  }
}