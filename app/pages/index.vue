<!-- pages/index.vue -->
<script setup lang="ts">
import type { FormattedCryptoCard } from '~/types/crypto'
import { SUPPORTED_ASSETS } from '~/types/crypto'
import type { CandlestickData } from 'lightweight-charts'

const { fetchTicker, fetchKlines } = useCryptoApi()

// Cargamos todas las monedas configuradas en SUPPORTED_ASSETS
const symbols = SUPPORTED_ASSETS.map(a => a.symbol)
const assets = ref<FormattedCryptoCard[]>([])
const chartData = ref<CandlestickData[]>([])

const isLoadingAssets = ref(true)
const isLoadingChart = ref(true)

const selectedSymbol = ref('BTCUSDT')
const selectedInterval = ref('1h')

const loadMarketData = async () => {
  const requests = symbols.map(s => fetchTicker(s))
  const results = await Promise.all(requests)
  assets.value = results.filter((item): item is FormattedCryptoCard => item !== null)
  isLoadingAssets.value = false
}

const loadChartData = async (symbol: string = selectedSymbol.value, interval: string = selectedInterval.value) => {
  isLoadingChart.value = true
  selectedSymbol.value = symbol
  selectedInterval.value = interval
  chartData.value = await fetchKlines(symbol, interval, 100)
  isLoadingChart.value = false
}

const handleSelectAsset = (symbolName: string) => {
  const fullSymbol = `${symbolName}USDT`
  loadChartData(fullSymbol, selectedInterval.value)
}

let intervalId: NodeJS.Timeout

onMounted(() => {
  loadMarketData()
  loadChartData()
  intervalId = setInterval(loadMarketData, 10000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-bold text-white">Mercado Principal</h2>
        <p class="text-xs text-slate-400">Precios en tiempo real de los 6 activos monitoreados</p>
      </div>

      <button 
        @click="loadMarketData"
        class="bg-dark-surface hover:bg-dark-border text-slate-300 text-xs px-3 py-2 rounded-lg border border-dark-border flex items-center gap-2 transition-all cursor-pointer"
      >
        <span>🔄</span>
        <span>Refrescar</span>
      </button>
    </div>

    <!-- Grid de Tarjetas (6 Monedas) -->
    <div v-if="!isLoadingAssets" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <div 
        v-for="asset in assets" 
        :key="asset.symbol"
        @click="handleSelectAsset(asset.symbol)"
        :class="[
          selectedSymbol.startsWith(asset.symbol) ? 'ring-2 ring-indigo-500 scale-[1.02]' : 'hover:border-slate-600',
          'cursor-pointer transition-all rounded-xl'
        ]"
      >
        <CryptoCard :asset="asset" />
      </div>
    </div>

    <!-- Skeleton Loading -->
    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <div v-for="i in 6" :key="i" class="h-28 bg-dark-surface/50 border border-dark-border rounded-xl animate-pulse"></div>
    </div>

    <!-- Gráficos -->
    <div class="pt-2 space-y-4">
      <ClientOnly>
        <CandlestickChart 
          :data="chartData" 
          :activeSymbol="selectedSymbol"
          :activeInterval="selectedInterval"
          @changeInterval="(tf) => loadChartData(selectedSymbol, tf)"
        />

        <RsiChart :data="chartData" />
        
        <template #fallback>
          <div class="h-[400px] bg-dark-surface border border-dark-border rounded-xl animate-pulse flex flex-col items-center justify-center gap-2 text-slate-400 text-sm">
            <span class="animate-spin text-xl">⏳</span>
            <span>Cargando gráfico de velas e indicadores...</span>
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>