<template>
  <header class="h-16 border-b border-dark-border bg-dark-surface/50 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-10">
    <div class="flex items-center gap-4">
      <h1 class="text-base font-semibold text-white">Panel de Control</h1>
      <span class="bg-dark-bg text-slate-400 text-xs px-2.5 py-1 rounded-full border border-dark-border font-mono">
        BTC / USD
      </span>
    </div>

    <div class="flex items-center gap-3">
      <!-- Indicador de estado de conexión API (Simulado) -->
      <div class="flex items-center gap-2 bg-dark-bg px-3 py-1.5 rounded-lg border border-dark-border text-xs">
        <span class="w-2 h-2 rounded-full bg-brand-bull animate-pulse"></span>
        <span class="text-slate-300 font-mono">API: Binance OK</span>
      </div>
    </div>
  </header>
</template>