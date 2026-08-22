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
  <aside class="w-64 bg-dark-surface border-r border-dark-border flex flex-col justify-between p-4 shrink-0 hidden md:flex">
    <div>
      <!-- Logo / Marca -->
      <div class="flex items-center gap-3 px-3 py-4 mb-6 border-b border-dark-border">
        <div class="w-8 h-8 rounded-lg bg-brand-primary/20 border border-brand-primary flex items-center justify-center font-bold text-brand-primary">
          F
        </div>
        <div>
          <h2 class="font-bold text-white text-sm leading-none">FinBot Pro</h2>
          <span class="text-[10px] text-slate-400 font-mono">v0.1.0 Simulación</span>
        </div>
      </div>

      <!-- Menú de Navegación -->
      <nav class="space-y-1">
        <a 
          v-for="item in navigation" 
          :key="item.name"
          href="#"
          :class="[
            item.active 
              ? 'bg-brand-primary/10 text-brand-primary border-r-2 border-brand-primary font-medium' 
              : 'text-slate-400 hover:bg-dark-bg hover:text-slate-200',
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all'
          ]"
        >
          <span>{{ item.icon }}</span>
          <span>{{ item.name }}</span>
        </a>
      </nav>
    </div>

    <!-- Presupuesto Inicial del Bot -->
    <div class="bg-dark-bg p-3.5 rounded-xl border border-dark-border">
      <div class="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-1">Fondo Inicial</div>
      <div class="text-lg font-bold text-white font-mono">10,00 €</div>
      <div class="text-[10px] text-brand-bull flex items-center gap-1 mt-1 font-mono">
        <span>●</span> Simulación Activa
      </div>
    </div>
  </aside>
</template>