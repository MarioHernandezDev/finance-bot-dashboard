<!-- components/RsiChart.vue -->
<script setup lang="ts">
import type { CandlestickData } from 'lightweight-charts'
import { calculateRSI } from '~/utils/indicators'

const props = defineProps<{
  data: CandlestickData[]
}>()

const chartContainer = ref<HTMLDivElement | null>(null)
let chart: any = null
let rsiSeries: any = null

const currentRSI = ref<number | null>(null)

onMounted(async () => {
  if (!chartContainer.value) return

  const { createChart, ColorType, LineSeries } = await import('lightweight-charts')

  chart = createChart(chartContainer.value, {
    layout: {
      background: { type: ColorType.Solid, color: '#FFFFFF' },
      textColor: '#475569',
    },
    grid: {
      vertLines: { color: '#F1F5F9' },
      horzLines: { color: '#F1F5F9' },
    },
    width: chartContainer.value.clientWidth,
    height: 150,
    timeScale: {
      borderColor: '#E2E8F0',
      visible: true,
      timeVisible: true,
    },
  })

  // Serie para la línea de RSI (Morada)
  rsiSeries = chart.addSeries(LineSeries, {
    color: '#8B5CF6',
    lineWidth: 2,
    title: 'RSI 14',
  })

  updateRsiData(props.data)

  const handleResize = () => {
    if (chart && chartContainer.value) {
      chart.applyOptions({ width: chartContainer.value.clientWidth })
    }
  }

  window.addEventListener('resize', handleResize)
})

const updateRsiData = (newData: CandlestickData[]) => {
  if (!newData || newData.length === 0 || !rsiSeries) return

  const rsiValues = calculateRSI(newData, 14)
  rsiSeries.setData(rsiValues)

  if (rsiValues.length > 0) {
    const lastRsi = rsiValues[rsiValues.length - 1].value
    currentRSI.value = parseFloat(lastRsi.toFixed(2))
  }

  if (chart) chart.timeScale().fitContent()
}

onUnmounted(() => {
  if (chart) {
    chart.remove()
    chart = null
  }
})

watch(() => props.data, (newData) => {
  updateRsiData(newData)
}, { deep: true })
</script>

<template>
  <div class="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-5">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h4 class="text-base font-semibold text-slate-900 uppercase tracking-tight">Oscilador RSI (14)</h4>
        <span 
          v-if="currentRSI !== null"
          :class="[
            currentRSI >= 70 ? 'bg-rose-50 text-rose-600 border-rose-200' :
            currentRSI <= 30 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
            'bg-slate-100 text-slate-600 border-slate-200',
            'text-xs px-3 py-1.5 rounded-xl border font-semibold'
          ]"
        >
          {{ currentRSI }} - {{ currentRSI >= 70 ? 'Sobrecompra' : currentRSI <= 30 ? 'Sobreventa' : 'Neutral' }}
        </span>
      </div>

      <div class="flex items-center gap-4 text-xs text-slate-600">
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-rose-400"></span> 70 Sobrecompra</span>
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> 30 Sobreventa</span>
      </div>
    </div>

    <div ref="chartContainer" class="w-full h-[150px]"></div>
  </div>
</template>