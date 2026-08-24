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
  <div class="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl shadow-black/10 space-y-4">
    <!-- Header destello -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
      <div class="flex items-center gap-3 min-w-0">
        <div class="bg-emerald-400/10 border border-emerald-400/30 p-2 rounded-xl text-emerald-300 text-xl shrink-0">
          🤖
        </div>
        <div>
          <h3 class="text-sm sm:text-base font-bold text-white tracking-wide flex flex-wrap items-center gap-2">
            Bot Algorítmico Automatizado
            <span class="text-[10px] bg-emerald-400/10 text-emerald-300 border border-emerald-400/20 px-2 py-0.5 rounded-full font-mono uppercase">Multi-Asset</span>
          </h3>
          <p class="text-xs text-slate-400">Escaneo dinámico con asignación por nivel de riesgo</p>
        </div>
      </div>

      <button 
        @click="toggleBot"
        :class="[
          isBotActive 
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/60 shadow-lg shadow-emerald-950/80 ring-2 ring-emerald-500/20' 
            : 'bg-slate-950 text-slate-400 border-slate-700 hover:border-slate-500',
          'w-full sm:w-auto px-4 py-3 rounded-xl border font-mono text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer'
        ]"
      >
        <span :class="[isBotActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500', 'w-2.5 h-2.5 rounded-full']"></span>
        <span class="tracking-wider">{{ isBotActive ? 'BOT ACTIVO' : 'BOT INACTIVO' }}</span>
      </button>
    </div>

    <!-- Ajustes de Presupuesto según Riesgo -->
    <div class="space-y-1.5">
      <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Asignación de Capital por Operación</span>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
        <div class="flex flex-col items-center gap-1.5">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-md border font-mono" :class="getRiskBadgeClass('LOW')">Bajo (BTC/ETH)</span>
          <div class="flex items-center gap-1">
            <input v-model.number="riskAllocation.LOW" type="number" class="w-16 bg-slate-900 border border-emerald-500/50 rounded-lg py-2 text-center text-xs text-emerald-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            <span class="text-xs font-bold text-slate-400">%</span>
          </div>
        </div>

        <div class="flex flex-col items-center gap-1.5">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-md border font-mono" :class="getRiskBadgeClass('MEDIUM')">Medio (SOL/LINK)</span>
          <div class="flex items-center gap-1">
            <input v-model.number="riskAllocation.MEDIUM" type="number" class="w-16 bg-slate-900 border border-amber-500/50 rounded-lg py-2 text-center text-xs text-amber-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-500" />
            <span class="text-xs font-bold text-slate-400">%</span>
          </div>
        </div>

        <div class="flex flex-col items-center gap-1.5">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-md border font-mono" :class="getRiskBadgeClass('HIGH')">Alto (FET/PEPE)</span>
          <div class="flex items-center gap-1">
            <input v-model.number="riskAllocation.HIGH" type="number" class="w-16 bg-slate-900 border border-rose-500/50 rounded-lg py-2 text-center text-xs text-rose-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-rose-500" />
            <span class="text-xs font-bold text-slate-400">%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Umbrales RSI -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
      <div>
        <label class="text-[10px] text-emerald-400 font-mono font-semibold block">Comprar si RSI <=</label>
        <input v-model.number="buyRsiThreshold" type="number" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-3 text-xs text-white font-mono mt-1 focus:outline-none focus:border-emerald-500" />
      </div>
      <div>
        <label class="text-[10px] text-rose-400 font-mono font-semibold block">Vender si RSI >=</label>
        <input v-model.number="sellRsiThreshold" type="number" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-3 text-xs text-white font-mono mt-1 focus:outline-none focus:border-rose-500" />
      </div>
    </div>

    <!-- Terminal de Logs -->
    <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 h-44 overflow-y-auto overscroll-contain font-mono text-xs space-y-1.5 shadow-inner shadow-black/40">
      <div v-if="botLogs.length > 0">
        <div v-for="(log, idx) in botLogs" :key="idx" class="text-slate-400 flex items-start gap-1.5 leading-relaxed">
          <span class="text-emerald-400 font-bold">></span>
          <span>{{ log }}</span>
        </div>
      </div>
      <div v-else class="text-slate-600 italic py-2 text-center">
        Haz clic en "BOT INACTIVO" para iniciar el monitoreo algorítmico...
      </div>
    </div>
  </div>
</template>