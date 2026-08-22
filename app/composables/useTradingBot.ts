// composables/useTradingBot.ts
import { calculateRSI, calculateSMA } from '~/utils/indicators'

export const useTradingBot = () => {
  const isBotActive = useState<boolean>('bot_active', () => false)
  const botLogs = useState<string[]>('bot_logs', () => [])
  
  // Umbrales de configuración de estrategia
  const buyRsiThreshold = useState<number>('bot_buy_rsi', () => 40)
  const sellRsiThreshold = useState<number>('bot_sell_rsi', () => 60)

  const { fetchKlines } = useCryptoApi()
  const { buyAsset, sellAsset } = usePaperTrading()

  const logMessage = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString()
    botLogs.value.unshift(`[${timestamp}] ${msg}`)
  }

  const evaluateMarket = async (symbol: string) => {
    if (!isBotActive.value) return

    const klines = await fetchKlines(symbol, '1m', 50)
    if (klines.length < 20) return

    const rsiValues = calculateRSI(klines, 14)
    const smaValues = calculateSMA(klines, 20)

    if (rsiValues.length === 0 || smaValues.length === 0) return

    const latestPrice = klines[klines.length - 1].close
    const latestRsi = rsiValues[rsiValues.length - 1].value
    const latestSma = smaValues[smaValues.length - 1].value

    logMessage(`Análisis ${symbol}: Precio $${latestPrice} | RSI: ${latestRsi.toFixed(1)} | SMA20: $${latestSma.toFixed(1)}`)

    // Estrategia configurable: Compra si RSI < umbral de compra
    if (latestRsi <= buyRsiThreshold.value && latestPrice > latestSma) {
      logMessage(`⚡ Señal de COMPRA (RSI ${latestRsi.toFixed(1)} <= ${buyRsiThreshold.value}) en ${symbol}`)
      const res = buyAsset(symbol, latestPrice, 300)
      logMessage(res.message)
    } 
    // Estrategia configurable: Venta si RSI > umbral de venta
    else if (latestRsi >= sellRsiThreshold.value) {
      logMessage(`⚡ Señal de VENTA (RSI ${latestRsi.toFixed(1)} >= ${sellRsiThreshold.value}) en ${symbol}`)
      const res = sellAsset(symbol, latestPrice, 100)
      logMessage(res.message)
    }
  }

  const toggleBot = () => {
    isBotActive.value = !isBotActive.value
    logMessage(isBotActive.value ? '🤖 Bot de Trading Activado' : '🛑 Bot de Trading Desactivado')
  }

  return {
    isBotActive,
    botLogs,
    buyRsiThreshold,
    sellRsiThreshold,
    toggleBot,
    evaluateMarket
  }
}