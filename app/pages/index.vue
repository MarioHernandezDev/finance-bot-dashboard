<!-- pages/index.vue -->
<script setup lang="ts">
import type { FormattedCryptoCard } from '~/types/crypto'
import type { CandlestickData } from 'lightweight-charts'

const { fetchTicker, fetchKlines } = useCryptoApi()

const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT']
const assets = ref<FormattedCryptoCard[]>([])
const chartData = ref<CandlestickData[]>([])

const isLoadingAssets = ref(true)
const isLoadingChart = ref(true)

// Control de selección
const selectedSymbol = ref('BTCUSDT')
const selectedInterval = ref('1h')

const loadMarketData = async () => {
  const requests = symbols.map(s => fetchTicker(s))
  const results = await Promise.all(requests)
  assets.value = results.filter((item): item is FormattedCryptoCard => item !== null)
  isLoadingAssets.value = false
}

// Carga las velas japonesas según la moneda e intervalo
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
        <p class="text-xs text-slate-400">Precios actualizados directamente desde Binance Spot</p>
      </div>

      <button 
        @click="loadMarketData"
        class="bg-dark-surface hover:bg-dark-border text-slate-300 text-xs px-3 py-2 rounded-lg border border-dark-border flex items-center gap-2 transition-all"
      >
        <span>🔄</span>
        <span>Refrescar</span>
      </button>
    </div>

    <!-- Grid de Tarjetas (Haz clic en cualquiera para actualizar el gráfico) -->
    <div v-if="!isLoadingAssets" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div 
        v-for="asset in assets" 
        :key="asset.symbol"
        @click="handleSelectAsset(asset.symbol)"
        :class="[
          selectedSymbol.startsWith(asset.symbol) ? 'ring-2 ring-brand-primary' : '',
          'cursor-pointer transition-all rounded-xl'
        ]"
      >
        <CryptoCard :asset="asset" />
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="h-32 bg-dark-surface/50 border border-dark-border rounded-xl animate-pulse"></div>
    </div>

    <!-- Sección del Gráfico Interactivo e Indicadores -->
    <div class="pt-2 space-y-4">
      <ClientOnly>
        <!-- Gráfico de Velas Japonesas + SMA 20 -->
        <CandlestickChart 
          :data="chartData" 
          :activeSymbol="selectedSymbol"
          :activeInterval="selectedInterval"
          @changeInterval="(tf) => loadChartData(selectedSymbol, tf)"
        />

        <!-- Sub-Gráfico del Oscilador RSI (14) -->
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