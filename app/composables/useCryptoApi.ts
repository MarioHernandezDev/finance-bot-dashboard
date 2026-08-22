// composables/useCryptoApi.ts
import type { CryptoTicker, FormattedCryptoCard } from '~/types/crypto'
import { SUPPORTED_ASSETS } from '~/types/crypto'
import type { CandlestickData, Time } from 'lightweight-charts'

export const useCryptoApi = () => {
  // Creamos el mapa de nombres dinámicamente a partir de SUPPORTED_ASSETS
  const nameMap = SUPPORTED_ASSETS.reduce<Record<string, string>>((acc, item) => {
    acc[item.symbol] = item.name
    return acc
  }, {})

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

  const fetchKlines = async (symbol: string = 'BTCUSDT', interval: string = '1h', limit: number = 100): Promise<CandlestickData[]> => {
    try {
      const data = await $fetch<any[]>(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      )

      return data.map((item) => {
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