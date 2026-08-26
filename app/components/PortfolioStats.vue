<!-- components/PortfolioStats.vue -->
<script setup lang="ts">
const props = defineProps<{
  prices: Record<string, number>
}>()

const { INITIAL_BALANCE, usdtBalance, getPortfolioValue } = usePaperTrading()

const totalPortfolioValue = computed(() => getPortfolioValue(props.prices))
const pnl = computed(() => totalPortfolioValue.value - INITIAL_BALANCE)
const pnlPercentage = computed(() => (pnl.value / INITIAL_BALANCE) * 100)

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
    <!-- Balance Virtual -->
    <div class="relative overflow-hidden bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
      <span class="text-sm text-slate-600 block">USDT Disponible</span>
      <span class="mt-4 block text-3xl font-bold text-slate-900 tracking-tight">{{ formatCurrency(usdtBalance) }}</span>
    </div>

    <!-- Valor Total del Portafolio -->
    <div class="relative overflow-hidden bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
      <span class="text-sm text-slate-600 block">Valor Total Portafolio</span>
      <span class="mt-4 block text-3xl font-bold text-slate-900 tracking-tight">{{ formatCurrency(totalPortfolioValue) }}</span>
    </div>

    <!-- PnL (Profit & Loss) -->
    <div class="relative overflow-hidden bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
      <span class="text-sm text-slate-600 block">Rendimiento (PnL Total)</span>
      <div class="flex items-center gap-3 mt-4">
        <span :class="pnl >= 0 ? 'text-emerald-700' : 'text-rose-700'" class="text-3xl font-bold tracking-tight">
          {{ pnl >= 0 ? '+' : '' }}{{ formatCurrency(pnl) }}
        </span>
        <span :class="pnl >= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'" class="text-xs px-3 py-1.5 rounded-full border">
          {{ pnlPercentage >= 0 ? '+' : '' }}{{ pnlPercentage.toFixed(2) }}%
        </span>
      </div>
    </div>
  </div>
</template>