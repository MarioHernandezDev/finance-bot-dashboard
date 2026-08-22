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
  <div class="space-y-6">
    <div>
      <h2 class="text-lg font-bold text-white">Consola de Paper Trading</h2>
      <p class="text-xs text-slate-400">Simula operaciones de compra y venta en tiempo real sin riesgo financiero</p>
    </div>

    <!-- KPIs del Portafolio (PnL y Balance) -->
    <PortfolioStats :prices="pricesMap" />

    <!-- Selector de Cripto (Todas las monedas) -->
    <div class="flex items-center gap-2 overflow-x-auto pb-1">
      <button
        v-for="symbol in symbols"
        :key="symbol"
        @click="selectedSymbol = symbol"
        :class="[
          selectedSymbol === symbol 
            ? 'bg-indigo-600 text-white font-bold border-indigo-500 shadow-md shadow-indigo-950/50' 
            : 'bg-dark-surface text-slate-400 hover:text-white border-dark-border',
          'px-3.5 py-2 rounded-xl border text-xs font-mono transition-all cursor-pointer whitespace-nowrap'
        ]"
      >
        {{ symbol.replace('USDT', '') }}/USDT
      </button>
    </div>

    <!-- Grid: Operativa Manual + Bot Algorítmico -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TradePanel 
        :symbol="selectedSymbol"
        :currentPrice="currentSelectedAssetPrice"
      />

      <BotControlPanel />
    </div>

    <!-- Historial de Transacciones -->
    <div class="bg-dark-surface border border-dark-border rounded-xl p-4 shadow-xl space-y-3">
      <h3 class="text-sm font-bold text-white flex items-center gap-2">
        <span>📋</span> Historial de Transacciones
      </h3>

      <div v-if="tradeHistory.length > 0" class="overflow-x-auto">
        <table class="w-full text-left text-xs font-mono">
          <thead class="text-slate-500 border-b border-dark-border uppercase text-[10px]">
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
            <tr v-for="trade in tradeHistory" :key="trade.id" class="hover:bg-dark-bg/50">
              <td class="py-2.5 text-slate-500">{{ trade.timestamp }}</td>
              <td class="py-2.5">
                <span :class="trade.type === 'BUY' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'" class="px-1.5 py-0.5 rounded font-bold">
                  {{ trade.type }}
                </span>
              </td>
              <td class="py-2.5 font-bold text-white">{{ trade.symbol }}</td>
              <td class="py-2.5">{{ formatCurrency(trade.price) }}</td>
              <td class="py-2.5">{{ trade.amount.toFixed(4) }}</td>
              <td class="py-2.5 text-right font-bold text-white">{{ formatCurrency(trade.total) }}</td>
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