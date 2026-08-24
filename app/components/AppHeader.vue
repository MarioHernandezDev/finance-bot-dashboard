<template>
  <header class="min-h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10">
    <div class="flex items-center gap-3 min-w-0">
      <h1 class="text-sm sm:text-base font-semibold text-white truncate">Panel de Control</h1>
      <span class="hidden sm:inline-flex bg-slate-900 text-slate-400 text-[10px] px-2.5 py-1 rounded-lg border border-slate-800 font-mono">
        BTC / USDT
      </span>
    </div>

    <div class="flex items-center gap-3">
      <!-- Indicador de estado de conexión API (Simulado) -->
      <div class="flex items-center gap-2 bg-slate-900/80 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] sm:text-xs">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="text-emerald-300 font-mono">ONLINE</span>
      </div>
    </div>
  </header>
</template>