// composables/useCryptoApi.ts
import type { CryptoTicker, FormattedCryptoCard } from '~/types/crypto'
import type { CandlestickData, Time } from 'lightweight-charts'

export const useCryptoApi = () => {
  const nameMap: Record<string, string> = {
    BTCUSDT: 'Bitcoin',
    ETHUSDT: 'Ethereum',
    SOLUSDT: 'Solana'
  }

  const fetchTicker = async (symbol: string): Promise<FormattedCryptoCard | null> => {
    try {
      const data = await $fetch<CryptoTicker>(
        `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
      )
      const price = parseFloat(data.lastPrice)
      const change24h = parseFloat(data.priceChangePercent)

      return {
        symbol: data.symbol.replace('USDT', ''),
        name: nameMap[data.symbol] || data.symbol,
        price,
        change24h,
        isPositive: change24h >= 0
      }
    } catch (error) {
      console.error(`Error al obtener datos para ${symbol}:`, error)
      return null
    }
  }

  // Nueva función para obtener el historial de Velas Japonesas
  const fetchKlines = async (symbol: string = 'BTCUSDT', interval: string = '1h', limit: number = 100): Promise<CandlestickData[]> => {
    try {
      // El endpoint /klines devuelve una matriz de arrays
      const data = await $fetch<any[]>(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      )

      // Mapeamos los datos de Binance al formato que requiere TradingView Lightweight Charts
      return data.map((item) => {
        // Binance entrega el tiempo en milisegundos (Unix timestamp)
        // TradingView prefiere el tiempo en segundos (milisegundos / 1000)
        const openTime = Math.floor(item[0] / 1000) as Time

        return {
          time: openTime,
          open: parseFloat(item[1]),
          high: parseFloat(item[2]),
          low: parseFloat(item[3]),
          close: parseFloat(item[4])
        }
      })
    } catch (error) {
      console.error(`Error al obtener klines para ${symbol}:`, error)
      return []
    }
  }

  return {
    fetchTicker,
    fetchKlines
  }
}