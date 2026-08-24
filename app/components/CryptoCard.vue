<!-- components/CryptoCard.vue -->
<script setup lang="ts">
import type { FormattedCryptoCard } from '~/types/crypto'

// Recibimos las props tipadas
defineProps<{
  asset: FormattedCryptoCard
  loading?: boolean
}>()

// Helper para formatear divisa
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(val)
}
</script>

<template>
  <div class="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 sm:p-4 hover:border-emerald-500/50 hover:-translate-y-0.5 transition-all">
    <div class="flex justify-between items-start mb-3 gap-2">
      <div>
        <h3 class="text-white font-bold text-sm leading-none truncate">{{ asset.name }}</h3>
        <span class="text-[10px] text-slate-500 font-mono">{{ asset.symbol }}/USDT</span>
      </div>
      
      <!-- Badge Porcentaje 24h -->
      <div 
        :class="[
          asset.isPositive 
            ? 'bg-brand-bull/10 text-brand-bull border-brand-bull/20' 
            : 'bg-brand-bear/10 text-brand-bear border-brand-bear/20',
          'px-1.5 sm:px-2 py-1 rounded-lg border text-[10px] font-mono font-semibold flex items-center gap-1 shrink-0'
        ]"
      >
        <span>{{ asset.isPositive ? '▲' : '▼' }}</span>
        <span>{{ Math.abs(asset.change24h).toFixed(2) }}%</span>
      </div>
    </div>

    <!-- Precio Principal -->
    <div class="space-y-1">
      <div class="text-lg sm:text-xl font-bold font-mono text-white tracking-tight truncate">
        {{ formatCurrency(asset.price) }}
      </div>
      <div class="text-[10px] text-slate-500">Precio en tiempo real</div>
    </div>
  </div>
</template>