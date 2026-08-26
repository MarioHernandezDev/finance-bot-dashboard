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
  <div class="max-w-[1680px] mx-auto space-y-7">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h2 class="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">Mercado Principal</h2>
        <p class="text-sm text-slate-600 mt-2 leading-relaxed">Seis activos monitorizados con datos actualizados automáticamente</p>
      </div>

      <button 
        @click="loadMarketData"
        class="bg-white hover:bg-slate-50 text-slate-700 text-sm px-5 py-3 rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
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
          selectedSymbol.startsWith(asset.symbol) ? 'ring-2 ring-emerald-300/60' : '',
          'cursor-pointer transition-all rounded-2xl'
        ]"
      >
        <CryptoCard :asset="asset" />
      </div>
    </div>

    <!-- Skeleton Loading -->
    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <div v-for="i in 6" :key="i" class="h-36 bg-white border border-slate-200/60 rounded-2xl shadow-sm animate-pulse"></div>
    </div>

    <!-- Gráficos -->
    <div class="pt-3 space-y-4">
      <ClientOnly>
        <CandlestickChart 
          :data="chartData" 
          :activeSymbol="selectedSymbol"
          :activeInterval="selectedInterval"
          @changeInterval="(tf) => loadChartData(selectedSymbol, tf)"
        />

        <RsiChart :data="chartData" />
        
        <template #fallback>
          <div class="h-[400px] bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/60 animate-pulse flex flex-col items-center justify-center gap-2 text-slate-500 text-sm">
            <span class="animate-spin text-xl">⏳</span>
            <span>Cargando gráfico de velas e indicadores...</span>
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>