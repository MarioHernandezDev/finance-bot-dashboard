<script setup lang="ts">
const props = defineProps<{
  symbol: string
  currentPrice: number
  usdtBalance: number
  holding: number
}>()

const emit = defineEmits<{ executed: [] }>()
const tradeAmount = ref(10)
const feedbackMessage = ref<string | null>(null)
const isError = ref(false)
const isSubmitting = ref(false)

const cleanSymbol = computed(() => props.symbol.replace(/USDT$/, ''))
const canBuy = computed(() => Number.isFinite(tradeAmount.value) && tradeAmount.value > 0 && tradeAmount.value <= Math.min(props.usdtBalance, 10))
const canSell = computed(() => Number.isFinite(tradeAmount.value) && tradeAmount.value > 0 && tradeAmount.value <= 10 && tradeAmount.value <= props.holding * props.currentPrice)

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

const showMessage = (message: string, error: boolean) => {
  feedbackMessage.value = message
  isError.value = error
  setTimeout(() => { feedbackMessage.value = null }, 4000)
}

const submitOrder = async (action: 'BUY' | 'SELL') => {
  const valid = action === 'BUY' ? canBuy.value : canSell.value
  if (!valid) {
    showMessage(action === 'BUY' ? 'El importe debe ser mayor que 0 y no superar 10 USDT ni tu saldo.' : 'El importe supera tu posición disponible o el límite de 10 USDT.', true)
    return
  }

  isSubmitting.value = true
  try {
    const response = await $fetch<{ message: string }>('/api/real-trading', {
      method: 'POST',
      body: { action, symbol: props.symbol, amount: tradeAmount.value }
    })
    showMessage(response.message, false)
    emit('executed')
  } catch (error: unknown) {
    showMessage(error instanceof Error ? error.message : 'No se pudo ejecutar la orden real.', true)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="bg-white border-2 border-rose-200 rounded-2xl p-6 shadow-sm space-y-7">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h3 class="text-xl font-semibold text-slate-900 flex items-center gap-3"><span>⚡</span> Operativa Manual REAL</h3>
        <p class="text-xs text-rose-700 font-bold uppercase mt-2">Dinero real / Binance Spot</p>
      </div>
      <span class="text-sm text-rose-800 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-200">Límite: 10.00 USDT</span>
    </div>

    <div v-if="feedbackMessage" :class="[isError ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200', 'text-sm p-4 rounded-xl border']">{{ feedbackMessage }}</div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div class="space-y-3">
        <label class="text-sm text-slate-600 font-medium">Monto a Operar (USDT)</label>
        <div class="relative flex items-center">
          <input v-model.number="tradeAmount" type="number" min="0.01" max="10" step="0.01" class="[appearance:textfield] w-full bg-white border border-slate-200 rounded-xl pl-3 pr-16 py-3.5 text-sm text-slate-800 font-mono shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400" />
          <span class="absolute right-3 text-sm text-slate-500 pointer-events-none">USDT</span>
        </div>
      </div>
      <div class="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-2">
        <span class="text-sm text-slate-600">Posición en {{ cleanSymbol }}</span>
        <span class="block text-base font-semibold text-slate-800">{{ holding.toFixed(6) }} {{ cleanSymbol }}</span>
        <span class="block text-sm text-slate-500">≈ {{ formatCurrency(holding * currentPrice) }}</span>
      </div>
    </div>

    <div class="flex items-center justify-between text-sm text-slate-600 border-t border-slate-100 pt-5">
      <span>Saldo disponible</span><strong class="text-slate-900">{{ formatCurrency(usdtBalance) }}</strong>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button :disabled="!canBuy || isSubmitting" @click="submitOrder('BUY')" class="bg-amber-500 hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all">🟡 COMPRAR {{ cleanSymbol }}</button>
      <button :disabled="!canSell || isSubmitting" @click="submitOrder('SELL')" class="bg-rose-600 hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all">🔴 VENDER {{ cleanSymbol }}</button>
    </div>
  </section>
</template>
