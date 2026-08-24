import type { RiskLevel } from '~/types/crypto'
import type { PaperTradingState } from './paper-trading'

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
  const storage = useStorage('bot-state')
  let settings: BotSettings | null = null
  try {
    const stored = await storage.getItem<BotSettings | string>('settings')
    if (typeof stored === 'string') {
      try {
        settings = JSON.parse(stored) as BotSettings
      } catch {
        await storage.removeItem('settings')
      }
    } else settings = stored
  } catch {
    await storage.removeItem('settings')
  }
  const normalizedSettings = normalizeSettings(settings)
  if (JSON.stringify(settings) !== JSON.stringify(normalizedSettings)) {
    await storage.setItem('settings', normalizedSettings)
  }
  return normalizedSettings
}

export const updateBotSettings = async (changes: Partial<BotSettings>) => {
  const settings = normalizeSettings({ ...(await getBotSettings()), ...changes })
  await useStorage('bot-state').setItem('settings', settings)
  return settings
}

export const appendBotLog = async (message: string) => {
  const settings = await getBotSettings()
  const logs = Array.isArray(settings.logs) ? settings.logs : []
  settings.logs = [`[${new Date().toLocaleTimeString()}] ${message}`, ...logs].slice(0, 200)
  await useStorage('bot-state').setItem('settings', settings)
}

export const getBotState = async () => ({
  ...(await getBotSettings()),
  paperTrading: await getPaperTradingState()
})

export type FullBotState = Awaited<ReturnType<typeof getBotState>>