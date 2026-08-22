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
  <div class="bg-dark-surface border border-dark-border rounded-xl p-5 hover:border-slate-700 transition-all">
    <div class="flex justify-between items-start mb-4">
      <div>
        <h3 class="text-white font-bold text-base leading-none">{{ asset.name }}</h3>
        <span class="text-xs text-slate-400 font-mono">{{ asset.symbol }}/USDT</span>
      </div>
      
      <!-- Badge Porcentaje 24h -->
      <div 
        :class="[
          asset.isPositive 
            ? 'bg-brand-bull/10 text-brand-bull border-brand-bull/20' 
            : 'bg-brand-bear/10 text-brand-bear border-brand-bear/20',
          'px-2.5 py-1 rounded-lg border text-xs font-mono font-semibold flex items-center gap-1'
        ]"
      >
        <span>{{ asset.isPositive ? '▲' : '▼' }}</span>
        <span>{{ Math.abs(asset.change24h).toFixed(2) }}%</span>
      </div>
    </div>

    <!-- Precio Principal -->
    <div class="space-y-1">
      <div class="text-2xl font-bold font-mono text-white tracking-tight">
        {{ formatCurrency(asset.price) }}
      </div>
      <div class="text-[11px] text-slate-400">Precio en tiempo real</div>
    </div>
  </div>
</template>