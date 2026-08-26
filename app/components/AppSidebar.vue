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
  <aside class="w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 flex flex-col justify-between p-5 shrink-0 hidden md:flex shadow-xl shadow-slate-200/50">
    <div>
      <!-- Logo / Marca -->
      <div class="flex items-center gap-3 px-1 py-3 mb-6 border-b border-slate-800">
        <div class="w-9 h-9 rounded-xl bg-emerald-400 flex items-center justify-center font-black text-white shadow-lg shadow-emerald-200">
          F
        </div>
        <div>
          <h2 class="font-bold text-slate-800 text-sm leading-none">FinBot Pro</h2>
          <span class="text-xs text-slate-500">COMMAND CENTER</span>
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
              ? 'bg-emerald-50 text-emerald-700 border-r-2 border-emerald-400 font-medium'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
            'flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all'
          ]"
        >
          <span>{{ item.icon }}</span>
          <span>{{ item.name }}</span>
        </a>
      </nav>
    </div>

    <!-- Presupuesto Inicial del Bot -->
    <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 shadow-inner shadow-slate-200/50">
      <div class="text-xs text-slate-600 font-medium uppercase tracking-wider mb-2">Fondo Inicial</div>
      <div class="text-lg font-bold text-slate-800">10,00 €</div>
      <div class="text-xs text-emerald-600 flex items-center gap-2 mt-2">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Simulación Activa
      </div>
    </div>
  </aside>
</template>