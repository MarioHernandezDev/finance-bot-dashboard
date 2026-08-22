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
  <div class="min-h-screen bg-dark-bg text-slate-100 flex flex-col md:flex-row font-sans">
    <!-- Sidebar / Menú Lateral -->
    <aside class="w-full md:w-64 bg-dark-surface border-r border-dark-border p-4 flex flex-col justify-between">
      <div class="space-y-6">
        <!-- Logo Header -->
        <div class="flex items-center gap-3 px-2">
          <div class="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-primary/30">
            ₿
          </div>
          <div>
            <h1 class="font-bold text-sm leading-none text-white">CryptoBot</h1>
            <span class="text-[10px] text-slate-400 font-mono">v1.0.0 • Nuxt 3</span>
          </div>
        </div>

        <!-- Links de Navegación -->
        <nav class="space-y-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            :class="[
              route.path === item.path
                ? 'bg-brand-primary/10 text-brand-primary font-semibold border-r-2 border-brand-primary'
                : 'text-slate-400 hover:bg-dark-bg hover:text-slate-200',
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all'
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
    <main class="flex-1 p-6 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>