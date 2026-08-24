<script setup lang="ts">
// Tipado simple para los elementos del menú
interface NavItem {
  name: string
  icon: string
  active?: boolean
}

const navigation: NavItem[] = [
  { name: 'Dashboard', icon: '📊', active: true },
  { name: 'Paper Trading', icon: '💼' },
  { name: 'Estrategias Bot', icon: '🤖' },
  { name: 'Ajustes', icon: '⚙️' }
]
</script>

<template>
  <aside class="w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col justify-between p-5 shrink-0 hidden md:flex">
    <div>
      <!-- Logo / Marca -->
      <div class="flex items-center gap-3 px-1 py-3 mb-6 border-b border-slate-800">
        <div class="w-9 h-9 rounded-xl bg-emerald-400 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-emerald-500/20">
          F
        </div>
        <div>
          <h2 class="font-bold text-white text-sm leading-none">FinBot Pro</h2>
          <span class="text-[10px] text-slate-500 font-mono">COMMAND CENTER</span>
        </div>
      </div>

      <!-- Menú de Navegación -->
      <nav class="space-y-1.5">
        <a 
          v-for="item in navigation" 
          :key="item.name"
          href="#"
          :class="[
            item.active 
              ? 'bg-emerald-400/10 text-emerald-300 border-r-2 border-emerald-400 font-medium'
              : 'text-slate-400 hover:bg-slate-950 hover:text-slate-200',
            'flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all'
          ]"
        >
          <span>{{ item.icon }}</span>
          <span>{{ item.name }}</span>
        </a>
      </nav>
    </div>

    <!-- Presupuesto Inicial del Bot -->
    <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
      <div class="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-1">Fondo Inicial</div>
      <div class="text-lg font-bold text-white font-mono">10,00 €</div>
      <div class="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Simulación Activa
      </div>
    </div>
  </aside>
</template>