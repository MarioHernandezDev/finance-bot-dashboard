// composables/useTradingBot.ts
import type { RiskLevel } from '~/types/crypto'

export const useTradingBot = () => {
  const isBotActive = useState('trading_bot_active', () => false)
  const botLogs = useState<string[]>('trading_bot_logs', () => [])
  const buyRsiThreshold = useState('trading_bot_buy_rsi', () => 35) // Ajustado a valor real
  const sellRsiThreshold = useState('trading_bot_sell_rsi', () => 65) // Ajustado a valor real
  const riskAllocation = useState<Record<RiskLevel, number>>('trading_bot_risk_allocation', () => ({
    LOW: 50,
    MEDIUM: 25,
    HIGH: 10
  }))
  const isRefreshing = ref(false)
  const refresh = async () => {
    isRefreshing.value = true
    try {
      const state = await $fetch<{ isActive: boolean; buyRsiThreshold: number; sellRsiThreshold: number; riskAllocation: Record<RiskLevel, number>; logs: string[] }>('/api/bot/state')
      isBotActive.value = state.isActive
      buyRsiThreshold.value = state.buyRsiThreshold
      sellRsiThreshold.value = state.sellRsiThreshold
      riskAllocation.value = state.riskAllocation
      botLogs.value = state.logs
    } finally {
      isRefreshing.value = false
    }
  }

  const updateSettings = async () => {
    await $fetch('/api/bot/state', { method: 'POST', body: {
      isActive: isBotActive.value,
      buyRsiThreshold: buyRsiThreshold.value,
      sellRsiThreshold: sellRsiThreshold.value,
      riskAllocation: riskAllocation.value
    } })
  }

  const toggleBot = async () => {
    isBotActive.value = !isBotActive.value
    await updateSettings()
  }

  let pollId: ReturnType<typeof setInterval> | undefined
  onMounted(() => {
    void refresh()
    pollId = setInterval(() => void refresh(), 3000)
  })
  onUnmounted(() => { if (pollId) clearInterval(pollId) })
  watch([buyRsiThreshold, sellRsiThreshold, riskAllocation], () => {
    if (!isRefreshing.value) void updateSettings()
  }, { deep: true })

  return {
    isBotActive,
    botLogs,
    buyRsiThreshold,
    sellRsiThreshold,
    riskAllocation,
    toggleBot,
    refresh
  }
}