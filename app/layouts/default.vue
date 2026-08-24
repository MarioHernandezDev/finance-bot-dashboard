<!-- layouts/default.vue -->
<!-- En layouts/default.vue -->
<script setup lang="ts">
const route = useRoute()

const navItems = [
  { name: 'Dashboard', path: '/', icon: '📊' },
  { name: 'Paper Trading (Demo)', path: '/paper-trading', icon: '🎮' },
  { name: 'Trading Real (10€)', path: '/live-trading', icon: '⚡' },
]
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-emerald-400/30">
    <!-- Sidebar / Menú Lateral -->
    <aside class="w-full md:w-64 bg-slate-900/90 border-b md:border-b-0 md:border-r border-slate-800/80 p-4 md:p-5 flex flex-col justify-between shrink-0">
      <div class="space-y-5">
        <!-- Logo Header -->
        <div class="flex items-center gap-3 px-1">
          <div class="w-9 h-9 rounded-xl bg-emerald-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-emerald-500/20">
            ₿
          </div>
          <div>
            <h1 class="font-bold text-sm leading-none text-white tracking-tight">CryptoBot</h1>
            <span class="text-[10px] text-slate-500 font-mono">COMMAND CENTER / v1.0</span>
          </div>
        </div>

        <!-- Links de Navegación -->
        <nav class="space-y-1.5">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            :class="[
              route.path === item.path
                ? 'bg-brand-primary/10 text-brand-primary font-semibold border-r-2 border-brand-primary'
                : 'text-slate-400 hover:bg-dark-bg hover:text-slate-200',
              'flex items-center gap-3 px-3 py-3 rounded-xl text-xs transition-all border border-transparent'
            ]"
          >
            <span>{{ item.icon }}</span>
            <span>{{ item.name }}</span>
          </NuxtLink>
        </nav>
      </div>

      <!-- Footer del Sidebar -->
      <div class="pt-4 border-t border-dark-border text-[11px] text-slate-500 font-mono flex items-center justify-between">
        <span>Estado API</span>
        <span class="flex items-center gap-1.5 text-emerald-400">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Binance Online
        </span>
      </div>
    </aside>

    <!-- Contenido Principal -->
    <main class="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_32rem)]">
      <slot />
    </main>
  </div>
</template>