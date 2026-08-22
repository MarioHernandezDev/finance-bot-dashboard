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

// --- Nuevos tipos para la gestión de riesgo del Bot ---

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export interface CryptoConfig {
  symbol: string
  name: string
  risk: RiskLevel
}

export const SUPPORTED_ASSETS: CryptoConfig[] = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', risk: 'LOW' },
  { symbol: 'ETHUSDT', name: 'Ethereum', risk: 'LOW' },
  { symbol: 'SOLUSDT', name: 'Solana', risk: 'MEDIUM' },
  { symbol: 'LINKUSDT', name: 'Chainlink', risk: 'MEDIUM' },
  { symbol: 'FETUSDT', name: 'Fetch.ai', risk: 'HIGH' },
  { symbol: 'PEPEUSDT', name: 'Pepe', risk: 'HIGH' }
]