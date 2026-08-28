<!-- components/TradePanel.vue -->
<script setup lang="ts">
const props = defineProps<{
  symbol: string
  currentPrice: number
}>()

const { usdtBalance, holdings, buyAsset, sellAsset } = usePaperTrading()

const tradeAmount = ref<number>(10)
const feedbackMessage = ref<string | null>(null)
const isError = ref(false)

const cleanSymbol = computed(() => props.symbol.replace('USDT', ''))
const userHolding = computed(() => holdings.value[cleanSymbol.value] || 0)
const canBuy = computed(() => Number.isFinite(tradeAmount.value) && tradeAmount.value > 0 && tradeAmount.value <= usdtBalance.value)

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

const handleBuy = async () => {
  if (!canBuy.value) {
    showMessage('El monto debe ser mayor que 0 y no superar el saldo disponible.', true)
    return
  }
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
  <div class="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <h3 class="text-xl font-semibold tracking-tight text-slate-900 flex items-center gap-3">
        <span>⚡</span> Operativa Manual (Paper Trading)
      </h3>
      <span class="self-start text-sm text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
        USDT Virtual: {{ formatCurrency(usdtBalance) }}
      </span>
    </div>

    <!-- Feedback Banner -->
    <div v-if="feedbackMessage" :class="[isError ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200', 'text-sm p-4 rounded-xl border transition-all']">
      {{ feedbackMessage }}
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
      <!-- En components/TradePanel.vue -->
<div class="space-y-3">
  <label class="text-sm text-slate-600 font-medium">Monto a Operar (USDT)</label>
  <div class="relative flex items-center">
    <input 
      v-model.number="tradeAmount"
      type="number" 
      min="0.01"
      :max="usdtBalance"
      class="[appearance:textfield] w-full bg-white border border-slate-200 rounded-xl pl-3 pr-16 py-3.5 text-sm text-slate-800 font-mono shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
      placeholder="10"
    />
    <span class="absolute right-3 text-sm text-slate-500 pointer-events-none">USDT</span>
  </div>
</div>

      <!-- Resumen de posición en esta moneda -->
      <div class="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 flex flex-col justify-center gap-2">
        <span class="text-sm text-slate-600">Tu posición en {{ cleanSymbol }}</span>
        <span class="text-base font-semibold text-slate-800">
          {{ userHolding.toFixed(4) }} {{ cleanSymbol }}
        </span>
        <span class="text-sm text-slate-500">
          ≈ {{ formatCurrency(userHolding * currentPrice) }}
        </span>
      </div>
    </div>

    <!-- Botones de Acción -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
      <button 
        @click="handleBuy"
        :disabled="!canBuy"
        class="bg-emerald-600 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] text-white font-medium py-3 px-6 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
      >
        <span>🟢</span> COMPRAR {{ cleanSymbol }}
      </button>

      <button 
        @click="handleSell"
        class="bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-medium py-3 px-6 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
      >
        <span>🔴</span> VENDER TODO
      </button>
    </div>
  </div>
</template>