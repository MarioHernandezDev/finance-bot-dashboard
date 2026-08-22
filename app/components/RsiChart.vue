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
      background: { type: ColorType.Solid, color: '#121824' },
      textColor: '#94A3B8',
    },
    grid: {
      vertLines: { color: '#1E293B' },
      horzLines: { color: '#1E293B' },
    },
    width: chartContainer.value.clientWidth,
    height: 150,
    timeScale: {
      visible: true,
      timeVisible: true,
    },
  })

  // Serie para la línea de RSI (Morada)
  rsiSeries = chart.addSeries(LineSeries, {
    color: '#A855F7',
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
  <div class="bg-dark-surface border border-dark-border rounded-xl p-4 shadow-xl space-y-2">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h4 class="text-xs font-bold text-white uppercase tracking-wider">Oscilador RSI (14)</h4>
        <span 
          v-if="currentRSI !== null"
          :class="[
            currentRSI >= 70 ? 'bg-red-500/20 text-red-400 border-red-500/30' :
            currentRSI <= 30 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
            'bg-purple-500/20 text-purple-400 border-purple-500/30',
            'text-[10px] font-mono px-2 py-0.5 rounded border font-semibold'
          ]"
        >
          {{ currentRSI }} - {{ currentRSI >= 70 ? 'Sobrecompra' : currentRSI <= 30 ? 'Sobreventa' : 'Neutral' }}
        </span>
      </div>

      <div class="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
        <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-red-400"></span> 70 Sobrecompra</span>
        <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> 30 Sobreventa</span>
      </div>
    </div>

    <div ref="chartContainer" class="w-full h-[150px]"></div>
  </div>
</template>