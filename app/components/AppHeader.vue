<template>
  <header class="min-h-[4.5rem] border-b border-slate-200/80 bg-white/80 backdrop-blur-xl px-5 sm:px-10 flex items-center justify-between sticky top-0 z-10 shadow-sm shadow-slate-200/40">
    <div class="flex items-center gap-3 min-w-0">
      <div>
        <p class="text-xs text-emerald-700 uppercase tracking-tight">Overview / Live market</p>
        <h1 class="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 truncate">Panel de Control</h1>
      </div>
      <span class="hidden sm:inline-flex bg-slate-50 text-slate-600 text-xs px-3 py-1.5 rounded-full border border-slate-200">
        BTC / USDT
      </span>
    </div>

    <div class="flex items-center gap-3">
      <!-- Indicador de estado de conexión API (Simulado) -->
      <div class="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-full border border-emerald-200 text-xs">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-300"></span>
        <span class="text-emerald-700 font-semibold">SYSTEM OK</span>
        <span class="hidden sm:inline text-slate-500">/ Mario H.</span>
      </div>
    </div>
  </header>
</template>