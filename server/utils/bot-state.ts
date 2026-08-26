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
  const { data, error } = await supabase
    .from('bot_state')
    .select('settings')
    .eq('id', BOT_STATE_ID)
    .maybeSingle()
  if (error) throw new Error(`No se pudo leer el estado del bot: ${error.message}`)

  const settings = data?.settings as Partial<BotSettings> | null | undefined
  const normalizedSettings = normalizeSettings(settings)
  if (JSON.stringify(settings || {}) !== JSON.stringify(normalizedSettings)) {
    const { error: saveError } = await supabase.from('bot_state').upsert({
      id: BOT_STATE_ID,
      is_active: normalizedSettings.isActive,
      settings: normalizedSettings
    })
    if (saveError) throw new Error(`No se pudo inicializar la configuración: ${saveError.message}`)
  }
  return normalizedSettings
}

export const updateBotSettings = async (changes: Partial<BotSettings>) => {
  const settings = normalizeSettings({ ...(await getBotSettings()), ...changes })
  const { error } = await supabase.from('bot_state').upsert({
    id: BOT_STATE_ID,
    is_active: settings.isActive,
    settings
  })
  if (error) throw new Error(`No se pudo guardar la configuración: ${error.message}`)
  return settings
}

export const appendBotLog = async (message: string, symbol?: string) => {
  const level = message.startsWith('❌') ? 'error' : message.startsWith('⚠️') ? 'warn' : 'info'
  const { error } = await supabase.from('bot_logs').insert({ message, level, symbol })
  if (error) throw new Error(`No se pudo guardar el log: ${error.message}`)
}

export const updateLastScanTimestamp = async () => {
  const { error } = await supabase.from('bot_state').upsert({
    id: BOT_STATE_ID,
    last_scan_timestamp: new Date().toISOString()
  })
  if (error) throw new Error(`No se pudo guardar la fecha del escaneo: ${error.message}`)
}

export const getBotState = async () => {
  const [{ data, error }, settings, paperTrading] = await Promise.all([
    supabase.from('bot_state').select('last_scan_timestamp').eq('id', BOT_STATE_ID).maybeSingle(),
    getBotSettings(),
    getPaperTradingState()
  ])
  if (error) throw new Error(`No se pudo leer la fecha del escaneo: ${error.message}`)

  const { data: logRows, error: logError } = await supabase
    .from('bot_logs')
    .select('timestamp, message')
    .order('timestamp', { ascending: false })
    .limit(200)
  if (logError) throw new Error(`No se pudieron leer los logs: ${logError.message}`)

  return {
    ...settings,
    logs: (logRows || []).map(log => `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.message}`),
    lastScanTimestamp: data?.last_scan_timestamp || null,
    paperTrading
  }
}

export type FullBotState = Awaited<ReturnType<typeof getBotState>>