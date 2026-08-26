import type { RiskLevel } from '~/types/crypto'
import type { PaperTradingState } from './paper-trading'
import { BOT_STATE_ID, supabase } from './supabase'

export interface BotSettings {
  isActive: boolean
  buyRsiThreshold: number
  sellRsiThreshold: number
  riskAllocation: Record<RiskLevel, number>
  logs: string[]
}

const defaultSettings = (): BotSettings => ({
  isActive: false,
  buyRsiThreshold: 35,
  sellRsiThreshold: 65,
  riskAllocation: { LOW: 50, MEDIUM: 25, HIGH: 10 },
  logs: []
})

const defaultPaperTradingState = (): PaperTradingState => ({
  usdtBalance: 10000,
  holdings: {},
  tradeHistory: []
})

const normalizeSettings = (stored: Partial<BotSettings> | null | undefined): BotSettings => {
  const defaults = defaultSettings()
  return {
    ...defaults,
    ...stored,
    riskAllocation: { ...defaults.riskAllocation, ...(stored?.riskAllocation || {}) },
    logs: Array.isArray(stored?.logs) ? stored.logs : []
  }
}

export const getBotSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('bot_state')
      .select('settings')
      .eq('id', BOT_STATE_ID)
      .maybeSingle()
    if (error) throw error

    const normalizedSettings = normalizeSettings(data?.settings as Partial<BotSettings> | null | undefined)
    if (!data || JSON.stringify(data.settings || {}) !== JSON.stringify(normalizedSettings)) {
      await ensureBotState(normalizedSettings)
    }
    return normalizedSettings
  } catch {
    return defaultSettings()
  }
}

const ensureBotState = async (settings = defaultSettings()) => {
  const { error } = await supabase.from('bot_state').upsert({
    id: BOT_STATE_ID,
    is_active: settings.isActive,
    usdt_balance: 10000,
    holdings: {},
    trade_history: [],
    settings
  })
  if (error) throw error
  return settings
}

export const updateBotSettings = async (changes: Partial<BotSettings>) => {
  try {
    const settings = normalizeSettings({ ...(await getBotSettings()), ...changes })
    await ensureBotState(settings)
    return settings
  } catch {
    return normalizeSettings(changes)
  }
}

export const appendBotLog = async (message: string, symbol?: string) => {
  const level = message.startsWith('❌') ? 'error' : message.startsWith('⚠️') ? 'warn' : 'info'
  const { error } = await supabase.from('bot_logs').insert({ message, level, symbol })
  if (error) throw new Error(`No se pudo guardar el log: ${error.message}`)
}

export const updateLastScanTimestamp = async () => {
  try {
    const { error } = await supabase.from('bot_state').upsert({
      id: BOT_STATE_ID,
      last_scan_timestamp: new Date().toISOString()
    })
    if (error) throw error
  } catch {
  }
}

export const getBotState = async () => {
  const fallbackState = {
    ...defaultSettings(),
    lastScanTimestamp: null,
    paperTrading: defaultPaperTradingState()
  }
  try {
    const [{ data }, settings, paperTrading] = await Promise.all([
      supabase.from('bot_state').select('last_scan_timestamp').eq('id', BOT_STATE_ID).maybeSingle(),
      getBotSettings(),
      getPaperTradingState().catch(() => defaultPaperTradingState())
    ])
    if (!data) await ensureBotState(settings)

    let logs: string[] = []
    try {
      const { data: logRows } = await supabase
        .from('bot_logs')
        .select('timestamp, message')
        .order('timestamp', { ascending: false })
        .limit(200)
      logs = (logRows || []).map(log => `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.message}`)
    } catch {
      logs = []
    }
    return { ...settings, logs, lastScanTimestamp: data?.last_scan_timestamp || null, paperTrading }
  } catch {
    try {
      await ensureBotState()
    } catch {
    }
    return fallbackState
  }
}

export type FullBotState = Awaited<ReturnType<typeof getBotState>>