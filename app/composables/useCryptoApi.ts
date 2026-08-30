// composables/useCryptoApi.ts
import type { FormattedCryptoCard } from '~/types/crypto'
import { SUPPORTED_ASSETS } from '~/types/crypto'
import type { CandlestickData, Time } from 'lightweight-charts'

export const useCryptoApi = () => {
  const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'
  const coingeckoIds: Record<string, string> = {
    BTCUSDT: 'bitcoin',
    ETHUSDT: 'ethereum',
    SOLUSDT: 'solana',
    LINKUSDT: 'chainlink',
    FETUSDT: 'fetch-ai',
    PEPEUSDT: 'pepe'
  }

  const nameMap = SUPPORTED_ASSETS.reduce<Record<string, string>>((acc, item) => {
    acc[item.symbol] = item.name
    return acc
  }, {})
  const lastTickers = new Map<string, FormattedCryptoCard>()
  const lastKlines = new Map<string, CandlestickData[]>()

  const fetchTicker = async (symbol: string): Promise<FormattedCryptoCard | null> => {
    const id = coingeckoIds[symbol]

    if (!id) {
      console.error(`Activo no configurado para CoinGecko: ${symbol}`)
      return lastTickers.get(symbol) || null
    }

    try {
      const data = await $fetch<Record<string, { usd?: number; usd_24h_change?: number }>>(
        `${COINGECKO_API_URL}/simple/price`,
        {
          query: {
            ids: id,
            vs_currencies: 'usd',
            include_24hr_change: 'true'
          }
        }
      )
      const price = data[id]?.usd
      const change24h = data[id]?.usd_24h_change

      if (!Number.isFinite(price) || !Number.isFinite(change24h)) {
        throw new Error(`Respuesta de precios inválida para ${symbol}`)
      }

      const ticker = {
        symbol: symbol.replace('USDT', ''),
        name: nameMap[symbol] || symbol,
        price,
        change24h,
        isPositive: change24h >= 0
      }

      lastTickers.set(symbol, ticker)
      return ticker
    } catch (error) {
      console.error(`Error al obtener datos para ${symbol}:`, error)
      return lastTickers.get(symbol) || null
    }
  }

  const fetchKlines = async (symbol: string = 'BTCUSDT', interval: string = '1h', limit: number = 100): Promise<CandlestickData[]> => {
    const id = coingeckoIds[symbol]
    const cacheKey = `${symbol}:${interval}:${limit}`

    if (!id) {
      console.error(`Activo no configurado para CoinGecko: ${symbol}`)
      return lastKlines.get(cacheKey) || []
    }

    try {
      const daysByInterval: Record<string, number> = {
        '1m': 1,
        '15m': 1,
        '1h': 7,
        '1d': 30
      }
      const data = await $fetch<number[][]>(
        `${COINGECKO_API_URL}/coins/${id}/ohlc`,
        {
          query: {
            vs_currency: 'usd',
            days: daysByInterval[interval] || 1
          }
        }
      )

      const klines = data
        .filter((item) => item.length >= 5 && item.every(Number.isFinite))
        .slice(-limit)
        .map((item) => {
        const openTime = Math.floor(item[0] / 1000) as Time

        return {
          time: openTime,
          open: parseFloat(item[1]),
          high: parseFloat(item[2]),
          low: parseFloat(item[3]),
          close: parseFloat(item[4])
        }
      })

      if (klines.length === 0) throw new Error(`Respuesta de velas vacía para ${symbol}`)
      lastKlines.set(cacheKey, klines)
      return klines
    } catch (error) {
      console.error(`Error al obtener klines para ${symbol}:`, error)
      return lastKlines.get(cacheKey) || []
    }
  }

  return {
    fetchTicker,
    fetchKlines
  }
}