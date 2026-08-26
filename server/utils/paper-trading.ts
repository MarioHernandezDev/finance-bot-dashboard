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
  holdings: Record<string, number>
  tradeHistory: TradePosition[]
}

export interface TradeResult {
  success: boolean
  message: string
}

import { BOT_STATE_ID, supabase } from './supabase'

const INITIAL_BALANCE = 10000

const defaultState = (): PaperTradingState => ({
  usdtBalance: INITIAL_BALANCE,
  holdings: { BTC: 0, ETH: 0, SOL: 0, LINK: 0, FET: 0, PEPE: 0 },
  tradeHistory: []
})

const normalizePaperTradingState = (stored: Partial<PaperTradingState> | null | undefined): PaperTradingState => {
  const defaults = defaultState()
  return {
    ...defaults,
    ...stored,
    holdings: { ...defaults.holdings, ...(stored?.holdings || {}) },
    tradeHistory: Array.isArray(stored?.tradeHistory) ? stored.tradeHistory : []
  }
}

export const getPaperTradingState = async () => {
  const { data, error } = await supabase
    .from('bot_state')
    .select('usdt_balance, holdings, trade_history')
    .eq('id', BOT_STATE_ID)
    .maybeSingle()
  if (error) throw new Error(`No se pudo leer la cartera: ${error.message}`)

  const state = data ? {
    usdtBalance: Number(data.usdt_balance),
    holdings: data.holdings as Record<string, number>,
    tradeHistory: data.trade_history as TradePosition[]
  } : null
  const normalizedState = normalizePaperTradingState(state)
  if (JSON.stringify(state) !== JSON.stringify(normalizedState)) {
    await savePaperTradingState(normalizedState)
  }
  return normalizedState
}

export const savePaperTradingState = async (state: PaperTradingState) => {
  const { error } = await supabase.from('bot_state').upsert({
    id: BOT_STATE_ID,
    usdt_balance: state.usdtBalance,
    holdings: state.holdings,
    trade_history: state.tradeHistory
  })
  if (error) throw new Error(`No se pudo guardar la cartera: ${error.message}`)
}

const normalizeSymbol = (symbol: string) => symbol.toUpperCase().replace(/USDT$/, '')

export const buyAsset = async (symbol: string, currentPrice: number, usdtAmount: number): Promise<TradeResult> => {
  const state = await getPaperTradingState()
  const cleanSymbol = normalizeSymbol(symbol)
  if (!cleanSymbol || !Number.isFinite(currentPrice) || currentPrice <= 0) return { success: false, message: 'El símbolo o precio no es válido.' }
  if (!Number.isFinite(usdtAmount) || usdtAmount <= 0) return { success: false, message: 'Ingresa un monto válido.' }
  if (usdtAmount > state.usdtBalance) return { success: false, message: 'Saldo virtual USDT insuficiente.' }

  const assetQuantity = usdtAmount / currentPrice
  state.usdtBalance -= usdtAmount
  state.holdings[cleanSymbol] = (state.holdings[cleanSymbol] || 0) + assetQuantity
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
  state.holdings[cleanSymbol] -= quantityToSell
  state.usdtBalance += usdtEarned
  state.tradeHistory.unshift({
    id: crypto.randomUUID(), symbol: cleanSymbol, type: 'SELL', price: currentPrice,
    amount: quantityToSell, total: usdtEarned, timestamp: new Date().toISOString()
  })
  await savePaperTradingState(state)
  return { success: true, message: `Venta ejecutada: ${quantityToSell.toFixed(4)} ${cleanSymbol}` }
}

export { INITIAL_BALANCE }