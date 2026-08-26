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
  <div class="min-h-screen bg-slate-50 text-slate-800 flex font-sans selection:bg-emerald-200/60">
    <aside class="hidden md:flex w-72 bg-white/90 backdrop-blur-xl border-r border-slate-200/80 p-6 flex-col justify-between shrink-0 shadow-sm shadow-slate-200/50">
      <div class="space-y-12">
        <div class="flex items-center gap-3 px-1">
          <div class="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-xl shadow-sm">₿</div>
          <div>
            <h1 class="font-bold text-base leading-none text-slate-800 tracking-tight">CryptoBot</h1>
            <span class="text-xs text-slate-500 tracking-tight">COMMAND CENTER</span>
          </div>
        </div>

        <div>
          <p class="px-3 mb-4 text-xs uppercase tracking-tight text-slate-500">Workspace</p>
          <nav class="space-y-2">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            :class="[
              route.path === item.path
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-md shadow-emerald-100'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border-transparent',
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 border'
            ]"
          >
            <span class="text-base opacity-80">{{ item.icon }}</span>
            <span class="font-semibold">{{ item.name }}</span>
            <span v-if="route.path === item.path" class="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-300"></span>
          </NuxtLink>
          </nav>
        </div>

        <div class="rounded-2xl border border-slate-200/60 bg-slate-50/80 p-5 space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs uppercase tracking-tight text-slate-500">System status</span>
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-300"></span>
          </div>
          <div class="flex items-center gap-2 text-sm text-slate-700"><span class="text-emerald-500">●</span> Binance Online</div>
          <div class="flex items-center gap-2 text-sm text-slate-600"><span class="text-sky-500">●</span> Supabase Synced</div>
        </div>
      </div>

      <div class="pt-5 border-t border-slate-200 text-xs text-slate-400 space-y-4">
        <div class="flex items-center justify-between"><span>FINBOT PRO</span><span>v1.0.0</span></div>
        <div><p class="text-slate-500 font-semibold text-sm">Designed & Engineered by Mario Hernández</p><span class="mt-2 inline-flex rounded-full bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs tracking-tight">DEVELOPER EDITION</span></div>
      </div>
    </aside>

    <div class="flex-1 min-w-0 flex flex-col bg-[radial-gradient(circle_at_75%_-10%,rgba(186,230,253,0.45),transparent_28rem),radial-gradient(circle_at_15%_20%,rgba(167,243,208,0.28),transparent_24rem)]">
      <AppHeader />
      <main class="flex-1 min-w-0 p-5 pb-24 sm:p-8 sm:pb-24 lg:p-10 lg:pb-10 overflow-y-auto">
        <slot />
      </main>
    </div>

    <nav class="md:hidden fixed bottom-0 inset-x-0 z-20 px-3 pb-3 pt-2 bg-white/90 backdrop-blur-xl border-t border-slate-200 shadow-2xl shadow-slate-300/50">
      <div class="grid grid-cols-3 gap-1">
        <NuxtLink v-for="item in navItems" :key="item.path" :to="item.path" :class="route.path === item.path ? 'text-white bg-slate-900 shadow-sm' : 'text-slate-500'" class="flex flex-col items-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all">
          <span class="text-lg leading-none">{{ item.icon }}</span><span>{{ item.name.replace(' (Demo)', '') }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>