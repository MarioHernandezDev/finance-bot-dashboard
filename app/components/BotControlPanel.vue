<!-- components/BotControlPanel.vue -->
<script setup lang="ts">
import type { RiskLevel } from '~/types/crypto'

const { 
  isBotActive, 
  botLogs, 
  buyRsiThreshold, 
  sellRsiThreshold, 
  riskAllocation, 
  toggleBot
} = useTradingBot()

const getRiskBadgeClass = (risk: RiskLevel) => {
  switch (risk) {
    case 'LOW': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-900/50'
    case 'MEDIUM': return 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm shadow-amber-900/50'
    case 'HIGH': return 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm shadow-rose-900/50'
  }
}
</script>

<template>
  <div class="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-8">
    <!-- Header destello -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2">
      <div class="flex items-center gap-3 min-w-0">
        <div class="bg-slate-100 border border-slate-200 p-3 rounded-xl text-slate-700 text-xl shrink-0">
          🤖
        </div>
        <div>
          <h3 class="text-xl font-semibold tracking-tight text-slate-900 flex flex-wrap items-center gap-3">
            Bot Algorítmico Automatizado
            <span class="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full uppercase">Multi-Asset</span>
          </h3>
          <p class="text-sm text-slate-500 mt-2 leading-relaxed">Escaneo dinámico con asignación por nivel de riesgo</p>
        </div>
      </div>

      <button 
        @click="toggleBot"
        :class="[
          isBotActive 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300',
          'w-full sm:w-auto px-6 py-3 rounded-xl border text-sm font-medium transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer'
        ]"
      >
        <span :class="[isBotActive ? 'bg-emerald-500' : 'bg-slate-400', 'w-2.5 h-2.5 rounded-full']"></span>
        <span>{{ isBotActive ? 'BOT ACTIVO' : 'BOT INACTIVO' }}</span>
      </button>
    </div>

    <!-- Ajustes de Presupuesto según Riesgo -->
    <div class="space-y-4">
      <span class="text-sm text-slate-600 block">Asignación de Capital por Operación</span>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200/60">
        <div class="flex flex-col items-center gap-4">
          <span class="text-sm font-semibold px-3 py-1.5 rounded-full border" :class="getRiskBadgeClass('LOW')">Bajo (BTC/ETH)</span>
          <div class="flex items-center gap-1">
            <input v-model.number="riskAllocation.LOW" type="number" class="[appearance:textfield] w-20 bg-slate-50 border border-slate-200 rounded-xl py-3 text-center text-base text-slate-800 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all" />
            <span class="text-sm font-medium text-slate-500">%</span>
          </div>
        </div>

        <div class="flex flex-col items-center gap-4">
          <span class="text-sm font-semibold px-3 py-1.5 rounded-full border" :class="getRiskBadgeClass('MEDIUM')">Medio (SOL/LINK)</span>
          <div class="flex items-center gap-1">
            <input v-model.number="riskAllocation.MEDIUM" type="number" class="[appearance:textfield] w-20 bg-slate-50 border border-slate-200 rounded-xl py-3 text-center text-base text-slate-800 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all" />
            <span class="text-sm font-medium text-slate-500">%</span>
          </div>
        </div>

        <div class="flex flex-col items-center gap-4">
          <span class="text-sm font-semibold px-3 py-1.5 rounded-full border" :class="getRiskBadgeClass('HIGH')">Alto (FET/PEPE)</span>
          <div class="flex items-center gap-1">
            <input v-model.number="riskAllocation.HIGH" type="number" class="[appearance:textfield] w-20 bg-slate-50 border border-slate-200 rounded-xl py-3 text-center text-base text-slate-800 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all" />
            <span class="text-sm font-medium text-slate-500">%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Umbrales RSI -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200/60">
      <div>
        <label class="text-sm text-emerald-700 font-semibold block">Comprar si RSI <=</label>
        <input v-model.number="buyRsiThreshold" type="number" class="[appearance:textfield] w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-800 mt-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all" />
      </div>
      <div>
        <label class="text-sm text-rose-700 font-semibold block">Vender si RSI >=</label>
        <input v-model.number="sellRsiThreshold" type="number" class="[appearance:textfield] w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-800 mt-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all" />
      </div>
    </div>

    <!-- Terminal de Logs -->
    <div class="bg-slate-100/80 border border-slate-200 rounded-2xl p-6 h-52 overflow-y-auto overscroll-contain font-mono text-sm space-y-2">
      <div v-if="botLogs.length > 0">
        <div v-for="(log, idx) in botLogs" :key="idx" class="text-slate-700 flex items-start gap-3 leading-relaxed">
          <span class="text-emerald-600 font-bold">›</span>
          <span>{{ log }}</span>
        </div>
      </div>
      <div v-else class="text-slate-500 italic py-3 text-center leading-relaxed">
        Haz clic en "BOT INACTIVO" para iniciar el monitoreo algorítmico...
      </div>
    </div>
  </div>
</template>