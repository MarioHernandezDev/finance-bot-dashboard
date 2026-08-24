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
  <div class="max-w-[1600px] mx-auto space-y-5 sm:space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="text-[10px] text-emerald-400 font-mono uppercase tracking-[0.2em]">Paper environment / online</span>
        </div>
        <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-white">Consola de Paper Trading</h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">Simulación de operaciones en tiempo real sin riesgo financiero</p>
      </div>
      <span class="self-start sm:self-auto text-[10px] font-mono text-slate-500 border border-slate-800 bg-slate-900/60 rounded-lg px-2.5 py-1.5">MARKET DATA / 10 SEC</span>
    </div>

    <!-- KPIs del Portafolio (PnL y Balance) -->
    <PortfolioStats :prices="pricesMap" />

    <!-- Selector de Cripto (Todas las monedas) -->
    <div class="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
      <button
        v-for="symbol in symbols"
        :key="symbol"
        @click="selectedSymbol = symbol"
        :class="[
          selectedSymbol === symbol 
            ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-md shadow-emerald-950/30'
            : 'bg-slate-900/80 text-slate-400 hover:text-white border-slate-800',
          'px-3.5 py-2.5 rounded-xl border text-xs font-mono transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap snap-start'
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
    <div class="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl shadow-black/10 space-y-3">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <span class="text-emerald-400">▦</span> Historial de Transacciones
        </h3>
        <span class="text-[10px] text-slate-500 font-mono uppercase">Execution ledger</span>
      </div>

      <div v-if="tradeHistory.length > 0" class="overflow-x-auto">
        <table class="w-full min-w-[620px] text-left text-xs font-mono">
          <thead class="text-slate-500 border-b border-slate-800 uppercase text-[10px]">
            <tr>
              <th class="pb-2">Hora</th>
              <th class="pb-2">Tipo</th>
              <th class="pb-2">Activo</th>
              <th class="pb-2">Precio Ej.</th>
              <th class="pb-2">Cantidad</th>
              <th class="pb-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-dark-border/50 text-slate-300">
            <tr v-for="trade in tradeHistory" :key="trade.id" class="hover:bg-slate-800/40">
              <td class="py-3 text-slate-500">{{ trade.timestamp }}</td>
              <td class="py-2.5">
                <span :class="trade.type === 'BUY' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'" class="px-1.5 py-0.5 rounded font-bold">
                  {{ trade.type }}
                </span>
              </td>
              <td class="py-3 font-bold text-white">{{ trade.symbol }}</td>
              <td class="py-3">{{ formatCurrency(trade.price) }}</td>
              <td class="py-3">{{ trade.amount.toFixed(4) }}</td>
              <td class="py-3 text-right font-bold text-white">{{ formatCurrency(trade.total) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-center py-6 text-slate-500 text-xs font-mono">
        No se han realizado operaciones simuladas aún.
      </div>
    </div>
  </div>
</template>