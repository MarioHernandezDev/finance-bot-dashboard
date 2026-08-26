<!-- pages/paper-trading.vue -->
<script setup lang="ts">
import type { FormattedCryptoCard } from '~/types/crypto'
import { SUPPORTED_ASSETS } from '~/types/crypto'

const { fetchTicker } = useCryptoApi()
const { tradeHistory } = usePaperTrading()

// Carga las 6 monedas dinámicamente desde SUPPORTED_ASSETS
const symbols = SUPPORTED_ASSETS.map(a => a.symbol)
const assets = ref<FormattedCryptoCard[]>([])
const selectedSymbol = ref('BTCUSDT')

const pricesMap = computed(() => {
  const map: Record<string, number> = {}
  assets.value.forEach(a => {
    map[`${a.symbol}USDT`] = a.price
  })
  return map
})

const currentSelectedAssetPrice = computed(() => {
  return pricesMap.value[selectedSymbol.value] || 0
})

const loadPrices = async () => {
  const requests = symbols.map(s => fetchTicker(s))
  const results = await Promise.all(requests)
  assets.value = results.filter((item): item is FormattedCryptoCard => item !== null)
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

let intervalId: NodeJS.Timeout

onMounted(() => {
  loadPrices()
  intervalId = setInterval(loadPrices, 10000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <div class="max-w-[1680px] mx-auto space-y-8">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
      <div>
        <div class="flex items-center gap-2 mb-3">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.9)]"></span>
          <span class="text-xs text-emerald-700 uppercase tracking-tight">Paper environment / online</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">Consola de Paper Trading</h2>
        <p class="text-sm text-slate-600 mt-2 leading-relaxed">Simulación de operaciones en tiempo real sin riesgo financiero</p>
      </div>
      <span class="self-start sm:self-auto text-xs text-slate-600 border border-slate-200 bg-white rounded-full px-4 py-2 shadow-sm">MARKET DATA / 10 SEC</span>
    </div>

    <!-- KPIs del Portafolio (PnL y Balance) -->
    <PortfolioStats :prices="pricesMap" />

    <!-- Selector de Cripto (Todas las monedas) -->
    <div class="flex items-center gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
      <button
        v-for="symbol in symbols"
        :key="symbol"
        @click="selectedSymbol = symbol"
        :class="[
          selectedSymbol === symbol 
            ? 'bg-emerald-400 text-slate-950 font-bold border-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.2)]'
            : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 shadow-sm hover:shadow-md',
          'px-5 py-2.5 rounded-full border text-sm transition-all duration-200 active:scale-[0.98] cursor-pointer whitespace-nowrap snap-start'
        ]"
      >
        {{ symbol.replace('USDT', '') }}/USDT
      </button>
    </div>

    <!-- Grid: Operativa Manual + Bot Algorítmico -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
      <TradePanel 
        :symbol="selectedSymbol"
        :currentPrice="currentSelectedAssetPrice"
      />

      <BotControlPanel />
    </div>

    <!-- Historial de Transacciones -->
    <div class="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-6">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-xl font-semibold tracking-tight text-slate-900 flex items-center gap-3">
          <span class="text-emerald-500">▦</span> Historial de Transacciones
        </h3>
        <span class="text-sm text-slate-500 uppercase tracking-tight">Execution ledger</span>
      </div>

      <div v-if="tradeHistory.length > 0" class="overflow-x-auto">
        <table class="w-full min-w-[680px] text-left text-sm border-separate border-spacing-y-2">
          <thead class="text-slate-600 border-b border-slate-200 uppercase text-xs">
            <tr>
              <th class="pb-2">Hora</th>
              <th class="pb-2">Tipo</th>
              <th class="pb-2">Activo</th>
              <th class="pb-3 text-right">Precio Ej.</th>
              <th class="pb-3 text-right">Cantidad</th>
              <th class="pb-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody class="text-slate-600 font-mono">
            <tr v-for="trade in tradeHistory" :key="trade.id" class="hover:bg-slate-50 transition-colors">
              <td class="py-3 text-slate-500">{{ trade.timestamp }}</td>
              <td class="py-2.5">
                <span :class="trade.type === 'BUY' ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-300 bg-rose-500/10 border-rose-500/20'" class="px-2 py-1 rounded-full border font-bold">
                  {{ trade.type }}
                </span>
              </td>
              <td class="py-3 font-bold text-slate-800">{{ trade.symbol }}</td>
              <td class="py-3 text-right">{{ formatCurrency(trade.price) }}</td>
              <td class="py-3 text-right">{{ trade.amount.toFixed(4) }}</td>
              <td class="py-3 text-right font-bold text-slate-800">{{ formatCurrency(trade.total) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-center py-8 text-slate-500 text-sm">
        No se han realizado operaciones simuladas aún.
      </div>
    </div>
  </div>
</template>