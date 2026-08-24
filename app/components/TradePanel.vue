<!-- components/TradePanel.vue -->
<script setup lang="ts">
const props = defineProps<{
  symbol: string
  currentPrice: number
}>()

const { usdtBalance, holdings, buyAsset, sellAsset } = usePaperTrading()

const tradeAmount = ref<number>(500)
const feedbackMessage = ref<string | null>(null)
const isError = ref(false)

const cleanSymbol = computed(() => props.symbol.replace('USDT', ''))
const userHolding = computed(() => holdings.value[cleanSymbol.value] || 0)

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

const handleBuy = async () => {
  const result = await buyAsset(props.symbol, props.currentPrice, tradeAmount.value)
  showMessage(result.message, !result.success)
}

const handleSell = async () => {
  const result = await sellAsset(props.symbol, props.currentPrice, 100)
  showMessage(result.message, !result.success)
}

const showMessage = (msg: string, error: boolean) => {
  feedbackMessage.value = msg
  isError.value = error
  setTimeout(() => { feedbackMessage.value = null }, 3000)
}
</script>

<template>
  <div class="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl shadow-black/10 space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
      <h3 class="text-sm font-bold text-white flex items-center gap-2">
        <span>⚡</span> Operativa Manual (Paper Trading)
      </h3>
      <span class="self-start text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
        USDT Virtual: {{ formatCurrency(usdtBalance) }}
      </span>
    </div>

    <!-- Feedback Banner -->
    <div v-if="feedbackMessage" :class="[isError ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', 'text-xs p-2.5 rounded-xl border font-mono transition-all']">
      {{ feedbackMessage }}
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      <!-- En components/TradePanel.vue -->
<div class="space-y-1.5">
  <label class="text-[11px] text-slate-400 font-medium">Monto a Operar (USDT)</label>
  <div class="relative flex items-center">
    <input 
      v-model.number="tradeAmount"
      type="number" 
      class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-16 py-3 text-sm text-white font-mono focus:outline-none focus:border-emerald-400"
      placeholder="500"
    />
    <span class="absolute right-3 text-xs text-slate-500 font-mono pointer-events-none">USDT</span>
  </div>
</div>

      <!-- Resumen de posición en esta moneda -->
      <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-center">
        <span class="text-[10px] text-slate-500 uppercase tracking-wider">Tu posición en {{ cleanSymbol }}</span>
        <span class="text-sm font-bold text-slate-200 font-mono">
          {{ userHolding.toFixed(4) }} {{ cleanSymbol }}
        </span>
        <span class="text-[10px] text-slate-400 font-mono">
          ≈ {{ formatCurrency(userHolding * currentPrice) }}
        </span>
      </div>
    </div>

    <!-- Botones de Acción -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
      <button 
        @click="handleBuy"
        class="bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
      >
        <span>🟢</span> COMPRAR {{ cleanSymbol }}
      </button>

      <button 
        @click="handleSell"
        class="bg-rose-500 hover:bg-rose-400 active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40"
      >
        <span>🔴</span> VENDER TODO
      </button>
    </div>
  </div>
</template>