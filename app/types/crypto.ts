// types/crypto.ts
export interface CryptoTicker {
  symbol: string
  priceChange: string
  priceChangePercent: string
  lastPrice: string
  highPrice: string
  lowPrice: string
  volume: string
}

export interface FormattedCryptoCard {
  symbol: string
  name: string
  price: number
  change24h: number
  isPositive: boolean
}