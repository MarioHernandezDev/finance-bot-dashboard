import { binanceSignedRequest, getRealTradingStatus } from '../utils/real-binance'

interface BinanceBalance {
  asset: string
  free: string
  locked: string
}

export default defineEventHandler(async () => {
  const status = getRealTradingStatus()
  if (!status.enabled) return { ...status, balances: [], usdtBalance: 0 }

  const account = await binanceSignedRequest<{ balances: BinanceBalance[] }>('GET', '/api/v3/account')
  const balances = account.balances
    .map(balance => ({
      asset: balance.asset,
      free: Number(balance.free),
      locked: Number(balance.locked),
      total: Number(balance.free) + Number(balance.locked)
    }))
    .filter(balance => Number.isFinite(balance.total) && balance.total > 0)

  return {
    ...status,
    balances,
    usdtBalance: balances.find(balance => balance.asset === 'USDT')?.free || 0
  }
})