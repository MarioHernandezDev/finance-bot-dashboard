export interface TradePosition {
  id: string
  symbol: string
  type: 'BUY' | 'SELL'
  price: number
  amount: number
  total: number
  timestamp: string
}

export interface PaperTradingState {
  usdtBalance: number
  initialBalance: number
  holdings: Record<string, number>
  averageBuyPrices: Record<string, number>
  stopLossPrices: Record<string, number>
  takeProfitPrices: Record<string, number>
  tradeHistory: TradePosition[]
}

export interface TradeResult {
  success: boolean
  message: string
}

import { BOT_STATE_ID, supabase } from './supabase'

const INITIAL_BALANCE = 100
let paperPortfolioId: string | null = null

const defaultState = (): PaperTradingState => ({
  usdtBalance: INITIAL_BALANCE,
  initialBalance: INITIAL_BALANCE,
  holdings: { BTC: 0, ETH: 0, SOL: 0, LINK: 0, FET: 0, PEPE: 0 },
  averageBuyPrices: {},
  stopLossPrices: {},
  takeProfitPrices: {},
  tradeHistory: []
})

const validBalanceOrDefault = (value: unknown, fallback: number) => {
  const balance = Number(value)
  return Number.isFinite(balance) && balance >= 0 ? balance : fallback
}

const normalizePaperTradingState = (stored: Partial<PaperTradingState> | null | undefined): PaperTradingState => {
  const defaults = defaultState()
  return {
    ...defaults,
    ...stored,
    usdtBalance: validBalanceOrDefault(stored?.usdtBalance, defaults.usdtBalance),
    initialBalance: validBalanceOrDefault(stored?.initialBalance, defaults.initialBalance),
    holdings: { ...defaults.holdings, ...(stored?.holdings || {}) },
    averageBuyPrices: { ...(stored?.averageBuyPrices || {}) },
    stopLossPrices: { ...(stored?.stopLossPrices || {}) },
    takeProfitPrices: { ...(stored?.takeProfitPrices || {}) },
    tradeHistory: Array.isArray(stored?.tradeHistory) ? stored.tradeHistory : []
  }
}

export const getPaperTradingState = async () => {
  const [{ data, error }, { data: portfolio, error: portfolioError }, { data: positions, error: positionsError }] = await Promise.all([
    supabase
      .from('bot_state')
      .select('usdt_balance, holdings, trade_history')
      .eq('id', BOT_STATE_ID)
      .maybeSingle(),
    supabase
      .from('paper_portfolio')
      .select('*')
      .limit(1)
      .maybeSingle(),
    supabase
      .from('paper_positions')
      .select('symbol, amount, average_buy_price, stop_loss_price, take_profit_price')
  ])
  if (error) throw new Error(`No se pudo leer la cartera: ${error.message}`)
  if (!portfolioError) {
    paperPortfolioId = typeof portfolio?.id === 'string' ? portfolio.id : null
  }

  const storedState = data ? {
    usdtBalance: Number(data.usdt_balance),
    initialBalance: Number(portfolio?.initial_balance),
    holdings: data.holdings as Record<string, number>,
    averageBuyPrices: {},
    stopLossPrices: {},
    takeProfitPrices: {},
    tradeHistory: data.trade_history as TradePosition[]
  } : null
  const defaults = defaultState()
  const restoredPositions = !positionsError && Array.isArray(positions) && positions.length > 0
    ? positions.reduce<{ holdings: Record<string, number>; averageBuyPrices: Record<string, number>; stopLossPrices: Record<string, number>; takeProfitPrices: Record<string, number> }>((restored, position) => {
      const symbol = normalizeSymbol(String(position.symbol || ''))
      if (!symbol) return restored
      restored.holdings[symbol] = validBalanceOrDefault(position.amount, 0)
      restored.averageBuyPrices[symbol] = validBalanceOrDefault(position.average_buy_price, 0)
      const averageBuyPrice = restored.averageBuyPrices[symbol]
      restored.stopLossPrices[symbol] = validBalanceOrDefault(position.stop_loss_price, averageBuyPrice * 0.98)
      restored.takeProfitPrices[symbol] = validBalanceOrDefault(position.take_profit_price, averageBuyPrice * 1.04)
      return restored
    }, { holdings: {}, averageBuyPrices: {}, stopLossPrices: {}, takeProfitPrices: {} })
    : null
  const normalizedState = normalizePaperTradingState({
    ...storedState,
    usdtBalance: portfolioError ? defaults.usdtBalance : portfolio?.current_balance,
    initialBalance: portfolioError ? defaults.initialBalance : portfolio?.initial_balance,
    ...(restoredPositions || {})
  })
  if (!portfolioError && !positionsError && JSON.stringify(storedState) !== JSON.stringify(normalizedState)) {
    await savePaperTradingState(normalizedState)
  }
  return normalizedState
}

export const savePaperTradingState = async (state: PaperTradingState) => {
  const portfolioPayload: {
    id?: string
    initial_balance: number
    current_balance: number
    updated_at: string
  } = {
    initial_balance: state.initialBalance,
    current_balance: state.usdtBalance,
    updated_at: new Date().toISOString()
  }
  if (paperPortfolioId) portfolioPayload.id = paperPortfolioId

  const positionRows = Object.entries(state.holdings).map(([symbol, amount]) => ({
    symbol,
    amount,
    average_buy_price: state.averageBuyPrices[symbol] || 0,
    stop_loss_price: state.stopLossPrices[symbol] || 0,
    take_profit_price: state.takeProfitPrices[symbol] || 0,
    updated_at: new Date().toISOString()
  }))
  const [{ error }, { data: savedPortfolio, error: portfolioError }, { error: positionsError }] = await Promise.all([
    supabase.from('bot_state').upsert({
      id: BOT_STATE_ID,
      usdt_balance: state.usdtBalance,
      holdings: state.holdings,
      trade_history: state.tradeHistory
    }),
    supabase
      .from('paper_portfolio')
      .upsert(portfolioPayload, { onConflict: 'id' })
      .select('*')
      .maybeSingle(),
    supabase
      .from('paper_positions')
      .upsert(positionRows, { onConflict: 'symbol' })
  ])
  if (error) throw new Error(`No se pudo guardar la cartera: ${error.message}`)
  if (portfolioError) throw new Error(`No se pudo guardar el balance de Paper Trading: ${portfolioError.message}`)
  if (positionsError) throw new Error(`No se pudieron guardar las posiciones de Paper Trading: ${positionsError.message}`)
  if (typeof savedPortfolio?.id === 'string') paperPortfolioId = savedPortfolio.id
}

const normalizeSymbol = (symbol: string) => symbol.toUpperCase().replace(/USDT$/, '')

export const buyAsset = async (symbol: string, currentPrice: number, usdtAmount: number): Promise<TradeResult> => {
  const state = await getPaperTradingState()
  const cleanSymbol = normalizeSymbol(symbol)
  if (!cleanSymbol || !Number.isFinite(currentPrice) || currentPrice <= 0) return { success: false, message: 'El símbolo o precio no es válido.' }
  if (!Number.isFinite(usdtAmount) || usdtAmount <= 0) return { success: false, message: 'Ingresa un monto válido.' }
  if (usdtAmount > state.usdtBalance) return { success: false, message: 'Saldo virtual USDT insuficiente.' }

  const assetQuantity = usdtAmount / currentPrice
  const currentAverageBuyPrice = state.averageBuyPrices[cleanSymbol] || 0
  const currentQuantity = state.holdings[cleanSymbol] || 0
  const nextQuantity = currentQuantity + assetQuantity
  state.usdtBalance -= usdtAmount
  state.holdings[cleanSymbol] = nextQuantity
  state.averageBuyPrices[cleanSymbol] = nextQuantity > 0
    ? ((currentQuantity * currentAverageBuyPrice) + usdtAmount) / nextQuantity
    : 0
  state.stopLossPrices[cleanSymbol] = state.averageBuyPrices[cleanSymbol] * 0.98
  state.takeProfitPrices[cleanSymbol] = state.averageBuyPrices[cleanSymbol] * 1.04
  state.tradeHistory.unshift({
    id: crypto.randomUUID(), symbol: cleanSymbol, type: 'BUY', price: currentPrice,
    amount: assetQuantity, total: usdtAmount, timestamp: new Date().toISOString()
  })
  await savePaperTradingState(state)
  return { success: true, message: `Compra ejecutada: ${assetQuantity.toFixed(4)} ${cleanSymbol}` }
}

export const sellAsset = async (symbol: string, currentPrice: number, percentage = 100): Promise<TradeResult> => {
  const state = await getPaperTradingState()
  const cleanSymbol = normalizeSymbol(symbol)
  const currentHolding = state.holdings[cleanSymbol] || 0
  if (!Number.isFinite(currentPrice) || currentPrice <= 0) return { success: false, message: 'El precio no es válido.' }
  if (currentHolding <= 0) return { success: false, message: `No tienes ${cleanSymbol} disponible para vender.` }

  const quantityToSell = currentHolding * (Math.min(Math.max(percentage, 0), 100) / 100)
  if (quantityToSell <= 0) return { success: false, message: 'El porcentaje de venta no es válido.' }
  const usdtEarned = quantityToSell * currentPrice
  state.holdings[cleanSymbol] = currentHolding - quantityToSell
  if (state.holdings[cleanSymbol] <= 0) {
    state.holdings[cleanSymbol] = 0
    state.averageBuyPrices[cleanSymbol] = 0
    state.stopLossPrices[cleanSymbol] = 0
    state.takeProfitPrices[cleanSymbol] = 0
  }
  state.usdtBalance += usdtEarned
  state.tradeHistory.unshift({
    id: crypto.randomUUID(), symbol: cleanSymbol, type: 'SELL', price: currentPrice,
    amount: quantityToSell, total: usdtEarned, timestamp: new Date().toISOString()
  })
  await savePaperTradingState(state)
  return { success: true, message: `Venta ejecutada: ${quantityToSell.toFixed(4)} ${cleanSymbol}` }
}

export { INITIAL_BALANCE }