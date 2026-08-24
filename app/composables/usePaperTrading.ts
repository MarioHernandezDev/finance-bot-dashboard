// composables/usePaperTrading.ts
export interface TradePosition {
  id: string
  symbol: string
  type: 'BUY' | 'SELL'
  price: number
  amount: number
  total: number
  timestamp: string
}

export interface TradeResult {
  success: boolean
  message: string
}

export const usePaperTrading = () => {
  const INITIAL_BALANCE = 10000
  const usdtBalance = useState<number>('paper_usdt_balance', () => INITIAL_BALANCE)
  
  const holdings = useState<Record<string, number>>('paper_holdings', () => ({}))

  const tradeHistory = useState<TradePosition[]>('paper_history', () => [])

  const refresh = async () => {
    const state = await $fetch<{ paperTrading: { usdtBalance: number; holdings: Record<string, number>; tradeHistory: TradePosition[] } }>('/api/bot/state')
    usdtBalance.value = state.paperTrading.usdtBalance
    holdings.value = state.paperTrading.holdings
    tradeHistory.value = state.paperTrading.tradeHistory
  }

  const buyAsset = async (symbolName: string, currentPrice: number, usdtAmount: number): Promise<TradeResult> => {
    const response = await $fetch<{ result: TradeResult }>(
      '/api/trading', { method: 'POST', body: { action: 'BUY', symbol: symbolName, price: currentPrice, amount: usdtAmount } }
    )
    await refresh()
    return response.result
  }

  const sellAsset = async (symbolName: string, currentPrice: number, percentage = 100): Promise<TradeResult> => {
    const response = await $fetch<{ result: TradeResult }>('/api/trading', {
      method: 'POST', body: { action: 'SELL', symbol: symbolName, price: currentPrice, percentage }
    })
    await refresh()
    return response.result
  }

  onMounted(() => { void refresh() })

  // Métricas de Portafolio
  const getPortfolioValue = (currentPrices: Record<string, number>) => {
    let holdingsValue = 0
    Object.keys(holdings.value).forEach(symbol => {
      const amount = holdings.value[symbol] || 0
      const price = currentPrices[`${symbol}USDT`] || 0
      holdingsValue += amount * price
    })
    return usdtBalance.value + holdingsValue
  }

  return {
    INITIAL_BALANCE,
    usdtBalance,
    holdings,
    tradeHistory,
    refresh,
    buyAsset,
    sellAsset,
    getPortfolioValue
  }
}