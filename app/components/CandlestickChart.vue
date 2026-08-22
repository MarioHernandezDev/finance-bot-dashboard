<!-- components/CandlestickChart.vue -->
<script setup lang="ts">
import type { CandlestickData } from 'lightweight-charts'
import { calculateSMA } from '~/utils/indicators'

const props = defineProps<{
  data: CandlestickData[]
  activeInterval: string
  activeSymbol?: string
}>()

const emit = defineEmits<{
  (e: 'changeInterval', interval: string): void
}>()

const chartContainer = ref<HTMLDivElement | null>(null)
let chart: any = null
let candlestickSeries: any = null
let smaSeries: any = null

const hoveredCandle = ref<CandlestickData | null>(null)
const showSMA = ref(true)

const timeframes = [
  { label: '1H', value: '1m' },
  { label: '24H', value: '15m' },
  { label: '7D', value: '1h' },
  { label: '1M', value: '1d' }
]

const formatCurrency = (val?: number) => {
  if (!val) return '$0.00'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

onMounted(async () => {
  if (!chartContainer.value) return

  const { createChart, ColorType, CandlestickSeries, LineSeries } = await import('lightweight-charts')

  chart = createChart(chartContainer.value, {
    layout: {
      background: { type: ColorType.Solid, color: '#121824' },
      textColor: '#94A3B8',
    },
    grid: {
      vertLines: { color: '#1E293B' },
      horzLines: { color: '#1E293B' },
    },
    width: chartContainer.value.clientWidth,
    height: 400,
    timeScale: {
      timeVisible: true,
      secondsVisible: false,
    },
  })

  // 1. Serie de Velas
  candlestickSeries = chart.addSeries(CandlestickSeries, {
    upColor: '#10B981',
    downColor: '#EF4444',
    borderVisible: false,
    wickUpColor: '#10B981',
    wickDownColor: '#EF4444',
  })

  // 2. Serie de Línea para SMA 20 (Azul)
  smaSeries = chart.addSeries(LineSeries, {
    color: '#3B82F6',
    lineWidth: 2,
    title: 'SMA 20',
  })

  updateChartData(props.data)

  chart.subscribeCrosshairMove((param: any) => {
    if (param.time && param.seriesData.has(candlestickSeries)) {
      const candle = param.seriesData.get(candlestickSeries) as CandlestickData
      hoveredCandle.value = candle
    } else {
      hoveredCandle.value = props.data[props.data.length - 1] || null
    }
  })

  const handleResize = () => {
    if (chart && chartContainer.value) {
      chart.applyOptions({ width: chartContainer.value.clientWidth })
    }
  }

  window.addEventListener('resize', handleResize)
})

const updateChartData = (newData: CandlestickData[]) => {
  if (!newData || newData.length === 0) return

  if (candlestickSeries) {
    candlestickSeries.setData(newData)
  }

  if (smaSeries) {
    if (showSMA.value) {
      const smaData = calculateSMA(newData, 20)
      smaSeries.setData(smaData)
    } else {
      smaSeries.setData([])
    }
  }

  hoveredCandle.value = newData[newData.length - 1]
  if (chart) chart.timeScale().fitContent()
}

const toggleSMA = () => {
  showSMA.value = !showSMA.value
  updateChartData(props.data)
}

onUnmounted(() => {
  if (chart) {
    chart.remove()
    chart = null
  }
})

watch(() => props.data, (newData) => {
  updateChartData(newData)
}, { deep: true })
</script>

<template>
  <div class="bg-dark-surface border border-dark-border rounded-xl p-4 shadow-xl space-y-3">
    <!-- Cabecera e Indicadores -->
    <div class="flex items-center justify-between flex-wrap gap-2">
      <div class="flex items-center gap-3">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <span>📈</span> {{ activeSymbol || 'BTCUSDT' }} - Histórico Real
        </h3>

        <!-- Toggle Indicador SMA -->
        <button
          @click="toggleSMA"
          :class="[
            showSMA ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-dark-bg text-slate-500 border-dark-border',
            'px-2 py-0.5 rounded text-[11px] font-mono border transition-all flex items-center gap-1.5'
          ]"
        >
          <span class="w-2 h-2 rounded-full bg-blue-500"></span>
          <span>SMA 20</span>
        </button>
      </div>

      <div class="flex items-center gap-1 bg-dark-bg p-1 rounded-lg border border-dark-border">
        <button
          v-for="tf in timeframes"
          :key="tf.value"
          @click="emit('changeInterval', tf.value)"
          :class="[
            activeInterval === tf.value
              ? 'bg-brand-primary text-white font-bold'
              : 'text-slate-400 hover:text-slate-200',
            'px-2.5 py-1 rounded text-xs transition-all font-mono'
          ]"
        >
          {{ tf.label }}
        </button>
      </div>
    </div>

    <!-- Módulo Didáctico / Tooltip Inspector OHLC -->
    <div v-if="hoveredCandle" class="bg-dark-bg border border-dark-border rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
      <div>
        <span class="text-slate-500 block text-[10px] uppercase">Apertura (Open)</span>
        <span class="text-slate-200 font-semibold">{{ formatCurrency(hoveredCandle.open) }}</span>
      </div>
      <div>
        <span class="text-slate-500 block text-[10px] uppercase">Máximo (High)</span>
        <span class="text-brand-bull font-semibold">{{ formatCurrency(hoveredCandle.high) }}</span>
      </div>
      <div>
        <span class="text-slate-500 block text-[10px] uppercase">Mínimo (Low)</span>
        <span class="text-brand-bear font-semibold">{{ formatCurrency(hoveredCandle.low) }}</span>
      </div>
      <div>
        <span class="text-slate-500 block text-[10px] uppercase">Cierre (Close)</span>
        <span :class="hoveredCandle.close >= hoveredCandle.open ? 'text-brand-bull' : 'text-brand-bear'" class="font-semibold">
          {{ formatCurrency(hoveredCandle.close) }}
        </span>
      </div>
    </div>

    <!-- Contenedor Canvas -->
    <div ref="chartContainer" class="w-full h-[380px]"></div>
  </div>
</template>