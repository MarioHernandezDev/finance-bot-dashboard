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
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <!-- Balance Virtual -->
    <div class="bg-dark-surface border border-dark-border rounded-xl p-4 shadow-xl">
      <span class="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">USDT Disponible</span>
      <span class="text-lg font-bold text-white font-mono">{{ formatCurrency(usdtBalance) }}</span>
    </div>

    <!-- Valor Total del Portafolio -->
    <div class="bg-dark-surface border border-dark-border rounded-xl p-4 shadow-xl">
      <span class="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Valor Total Portafolio</span>
      <span class="text-lg font-bold text-slate-200 font-mono">{{ formatCurrency(totalPortfolioValue) }}</span>
    </div>

    <!-- PnL (Profit & Loss) -->
    <div class="bg-dark-surface border border-dark-border rounded-xl p-4 shadow-xl">
      <span class="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Rendimiento (PnL Total)</span>
      <div class="flex items-center gap-2">
        <span :class="pnl >= 0 ? 'text-emerald-400' : 'text-red-400'" class="text-lg font-bold font-mono">
          {{ pnl >= 0 ? '+' : '' }}{{ formatCurrency(pnl) }}
        </span>
        <span :class="pnl >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'" class="text-[10px] font-mono px-1.5 py-0.5 rounded border">
          {{ pnlPercentage >= 0 ? '+' : '' }}{{ pnlPercentage.toFixed(2) }}%
        </span>
      </div>
    </div>
  </div>
</template>