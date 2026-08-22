<!-- components/BotControlPanel.vue -->
<script setup lang="ts">
import { SUPPORTED_ASSETS, type RiskLevel } from '~/types/crypto'

const { 
  isBotActive, 
  botLogs, 
  buyRsiThreshold, 
  sellRsiThreshold, 
  riskAllocation, 
  toggleBot, 
  evaluateMarket 
} = useTradingBot()

const SCAN_INTERVAL_MS = 10000
let timeoutId: ReturnType<typeof setTimeout> | undefined
let isScanning = false

const scanAllMarkets = async () => {
  if (isScanning) return
  isScanning = true
  try {
    for (const asset of SUPPORTED_ASSETS) {
      await evaluateMarket(asset.symbol)
    }
  } finally {
    isScanning = false
    if (isBotActive.value) scheduleNextScan()
  }
}

const clearScanTimeout = () => {
  if (timeoutId !== undefined) {
    clearTimeout(timeoutId)
    timeoutId = undefined
  }
}

const scheduleNextScan = () => {
  clearScanTimeout()
  if (!isBotActive.value) return
  timeoutId = setTimeout(() => {
    timeoutId = undefined
    void scanAllMarkets()
  }, SCAN_INTERVAL_MS)
}

watch(isBotActive, (active) => {
  clearScanTimeout()
  if (active) void scanAllMarkets()
})

onUnmounted(() => {
  clearScanTimeout()
  isBotActive.value = false
})

const getRiskBadgeClass = (risk: RiskLevel) => {
  switch (risk) {
    case 'LOW': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-900/50'
    case 'MEDIUM': return 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm shadow-amber-900/50'
    case 'HIGH': return 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm shadow-rose-900/50'
  }
}
</script>

<template>
  <div class="bg-gradient-to-b from-dark-surface to-dark-bg border border-indigo-500/30 rounded-2xl p-5 shadow-2xl shadow-indigo-950/20 space-y-4">
    <!-- Header destello -->
    <div class="flex items-center justify-between border-b border-dark-border/80 pb-3">
      <div class="flex items-center gap-3">
        <div class="bg-indigo-500/20 border border-indigo-500/40 p-2 rounded-xl text-indigo-400 text-xl">
          🤖
        </div>
        <div>
          <h3 class="text-base font-bold text-white tracking-wide flex items-center gap-2">
            Bot Algorítmico Automatizado
            <span class="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono uppercase">Multi-Asset</span>
          </h3>
          <p class="text-xs text-slate-400">Escaneo dinámico con asignación por nivel de riesgo</p>
        </div>
      </div>

      <button 
        @click="toggleBot"
        :class="[
          isBotActive 
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/60 shadow-lg shadow-emerald-950/80 ring-2 ring-emerald-500/20' 
            : 'bg-dark-surface text-slate-400 border-dark-border hover:border-slate-500',
          'px-4 py-2.5 rounded-xl border font-mono text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer'
        ]"
      >
        <span :class="[isBotActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500', 'w-2.5 h-2.5 rounded-full']"></span>
        <span class="tracking-wider">{{ isBotActive ? 'BOT ACTIVO' : 'BOT INACTIVO' }}</span>
      </button>
    </div>

    <!-- Ajustes de Presupuesto según Riesgo -->
    <div class="space-y-1.5">
      <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Asignación de Capital por Operación</span>
      <div class="grid grid-cols-3 gap-2 bg-dark-bg/80 p-3 rounded-xl border border-dark-border">
        <div class="flex flex-col items-center gap-1.5">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-md border font-mono" :class="getRiskBadgeClass('LOW')">Bajo (BTC/ETH)</span>
          <div class="flex items-center gap-1">
            <input v-model.number="riskAllocation.LOW" type="number" class="w-14 bg-dark-surface border border-emerald-500/50 rounded-lg py-1 text-center text-xs text-emerald-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            <span class="text-xs font-bold text-slate-400">%</span>
          </div>
        </div>

        <div class="flex flex-col items-center gap-1.5">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-md border font-mono" :class="getRiskBadgeClass('MEDIUM')">Medio (SOL/LINK)</span>
          <div class="flex items-center gap-1">
            <input v-model.number="riskAllocation.MEDIUM" type="number" class="w-14 bg-dark-surface border border-amber-500/50 rounded-lg py-1 text-center text-xs text-amber-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-500" />
            <span class="text-xs font-bold text-slate-400">%</span>
          </div>
        </div>

        <div class="flex flex-col items-center gap-1.5">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-md border font-mono" :class="getRiskBadgeClass('HIGH')">Alto (FET/PEPE)</span>
          <div class="flex items-center gap-1">
            <input v-model.number="riskAllocation.HIGH" type="number" class="w-14 bg-dark-surface border border-rose-500/50 rounded-lg py-1 text-center text-xs text-rose-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-rose-500" />
            <span class="text-xs font-bold text-slate-400">%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Umbrales RSI -->
    <div class="grid grid-cols-2 gap-3 bg-dark-bg/80 p-3 rounded-xl border border-dark-border">
      <div>
        <label class="text-[10px] text-emerald-400 font-mono font-semibold block">Comprar si RSI <=</label>
        <input v-model.number="buyRsiThreshold" type="number" class="w-full bg-dark-surface border border-dark-border rounded-lg px-2.5 py-1 text-xs text-white font-mono mt-1 focus:outline-none focus:border-emerald-500" />
      </div>
      <div>
        <label class="text-[10px] text-rose-400 font-mono font-semibold block">Vender si RSI >=</label>
        <input v-model.number="sellRsiThreshold" type="number" class="w-full bg-dark-surface border border-dark-border rounded-lg px-2.5 py-1 text-xs text-white font-mono mt-1 focus:outline-none focus:border-rose-500" />
      </div>
    </div>

    <!-- Terminal de Logs -->
    <div class="bg-black/60 border border-dark-border rounded-xl p-3 h-40 overflow-y-auto font-mono text-[11px] space-y-1.5 shadow-inner">
      <div v-if="botLogs.length > 0">
        <div v-for="(log, idx) in botLogs" :key="idx" class="text-slate-300 flex items-start gap-1.5">
          <span class="text-indigo-400 font-bold">></span>
          <span>{{ log }}</span>
        </div>
      </div>
      <div v-else class="text-slate-600 italic py-2 text-center">
        Haz clic en "BOT INACTIVO" para iniciar el monitoreo algorítmico...
      </div>
    </div>
  </div>
</template>