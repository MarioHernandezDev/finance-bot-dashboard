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

export const usePaperTrading = () => {
  const INITIAL_BALANCE = 10000
  const usdtBalance = useState<number>('paper_usdt_balance', () => INITIAL_BALANCE)
  
  const holdings = useState<Record<string, number>>('paper_holdings', () => ({
    BTC: 0,
    ETH: 0,
    SOL: 0
  }))

  const tradeHistory = useState<TradePosition[]>('paper_history', () => [])

  const buyAsset = (symbolName: string, currentPrice: number, usdtAmount: number) => {
    if (usdtAmount <= 0) return { success: false, message: 'Ingresa un monto válido.' }
    if (usdtAmount > usdtBalance.value) return { success: false, message: 'Saldo virtual USDT insuficiente.' }

    const assetQuantity = usdtAmount / currentPrice
    const cleanSymbol = symbolName.replace('USDT', '')

    usdtBalance.value -= usdtAmount
    holdings.value[cleanSymbol] = (holdings.value[cleanSymbol] || 0) + assetQuantity

    const newTrade: TradePosition = {
      id: Math.random().toString(36).substring(2, 9),
      symbol: cleanSymbol,
      type: 'BUY',
      price: currentPrice,
      amount: assetQuantity,
      total: usdtAmount,
      timestamp: new Date().toLocaleTimeString()
    }

    tradeHistory.value.unshift(newTrade)
    return { success: true, message: `Compra ejecutada: ${assetQuantity.toFixed(4)} ${cleanSymbol}` }
  }

  const sellAsset = (symbolName: string, currentPrice: number, percentage: number = 100) => {
    const cleanSymbol = symbolName.replace('USDT', '')
    const currentHolding = holdings.value[cleanSymbol] || 0

    if (currentHolding <= 0) return { success: false, message: `No tienes ${cleanSymbol} disponible para vender.` }

    const quantityToSell = currentHolding * (percentage / 100)
    const usdtEarned = quantityToSell * currentPrice

    holdings.value[cleanSymbol] -= quantityToSell
    usdtBalance.value += usdtEarned

    const newTrade: TradePosition = {
      id: Math.random().toString(36).substring(2, 9),
      symbol: cleanSymbol,
      type: 'SELL',
      price: currentPrice,
      amount: quantityToSell,
      total: usdtEarned,
      timestamp: new Date().toLocaleTimeString()
    }

    tradeHistory.value.unshift(newTrade)
    return { success: true, message: `Venta ejecutada: ${quantityToSell.toFixed(4)} ${cleanSymbol}` }
  }

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
    buyAsset,
    sellAsset,
    getPortfolioValue
  }
}