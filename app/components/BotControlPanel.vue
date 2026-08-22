<!-- components/BotControlPanel.vue -->
<script setup lang="ts">
const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT']

const { isBotActive, botLogs, buyRsiThreshold, sellRsiThreshold, toggleBot, evaluateMarket } = useTradingBot()

let intervalId: NodeJS.Timeout

// Función para escanear y evaluar todos los activos secuencialmente
const scanAllMarkets = async () => {
  for (const sym of symbols) {
    await evaluateMarket(sym)
  }
}

watch(isBotActive, (active) => {
  if (active) {
    scanAllMarkets()
    intervalId = setInterval(scanAllMarkets, 10000) // Escanea los 3 activos cada 10 segundos
  } else {
    if (intervalId) clearInterval(intervalId)
  }
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <div class="bg-dark-surface border border-dark-border rounded-xl p-4 shadow-xl space-y-4">
    <div class="flex items-center justify-between border-b border-dark-border pb-3">
      <div class="flex items-center gap-2">
        <span class="text-lg">🤖</span>
        <div>
          <h3 class="text-sm font-bold text-white">Bot Algorítmico Automatizado</h3>
          <p class="text-[11px] text-slate-400">Escaneo Multi-Activo (BTC, ETH, SOL) • RSI(14)</p>
        </div>
      </div>

      <button 
        @click="toggleBot"
        :class="[
          isBotActive 
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-950/50' 
            : 'bg-dark-bg text-slate-400 border-dark-border',
          'px-4 py-2 rounded-lg border font-mono text-xs font-bold transition-all flex items-center gap-2'
        ]"
      >
        <span :class="[isBotActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500', 'w-2 h-2 rounded-full']"></span>
        <span>{{ isBotActive ? 'BOT ACTIVO' : 'BOT INACTIVO' }}</span>
      </button>
    </div>

    <!-- Inputs de Ajuste de Estrategia -->
    <div class="grid grid-cols-2 gap-3 bg-dark-bg/60 p-2.5 rounded-lg border border-dark-border">
      <div>
        <label class="text-[10px] text-emerald-400 font-mono block">Comprar si RSI <=</label>
        <input 
          v-model.number="buyRsiThreshold" 
          type="number" 
          class="w-full bg-dark-surface border border-dark-border rounded px-2 py-1 text-xs text-white font-mono mt-1 focus:outline-none focus:border-emerald-500"
        />
      </div>
      <div>
        <label class="text-[10px] text-red-400 font-mono block">Vender si RSI >=</label>
        <input 
          v-model.number="sellRsiThreshold" 
          type="number" 
          class="w-full bg-dark-surface border border-dark-border rounded px-2 py-1 text-xs text-white font-mono mt-1 focus:outline-none focus:border-red-500"
        />
      </div>
    </div>

    <!-- Terminal de Logs -->
    <div class="bg-dark-bg border border-dark-border rounded-lg p-3 h-36 overflow-y-auto font-mono text-[11px] space-y-1">
      <div v-if="botLogs.length > 0">
        <div v-for="(log, idx) in botLogs" :key="idx" class="text-slate-300">
          <span class="text-brand-primary">></span> {{ log }}
        </div>
      </div>
      <div v-else class="text-slate-600 italic">
        Haz clic en "BOT INACTIVO" para iniciar el escaneo algorítmico en tiempo real...
      </div>
    </div>
  </div>
</template>