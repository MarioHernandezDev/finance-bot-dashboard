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
  <div class="h-full bg-white border border-slate-200/60 rounded-2xl p-6 hover:border-slate-300/60 hover:shadow-md transition-all duration-200 shadow-sm">
    <div class="flex justify-between items-start mb-6 gap-4">
      <div>
        <h3 class="text-slate-800 font-bold text-sm leading-none truncate">{{ asset.name }}</h3>
        <span class="text-sm text-slate-500">{{ asset.symbol }}/USDT</span>
      </div>
      
      <!-- Badge Porcentaje 24h -->
      <div 
        :class="[
          asset.isPositive 
            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
            : 'bg-rose-50 text-rose-600 border-rose-100',
          'px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1 shrink-0'
        ]"
      >
        <span>{{ asset.isPositive ? '▲' : '▼' }}</span>
        <span>{{ Math.abs(asset.change24h).toFixed(2) }}%</span>
      </div>
    </div>

    <!-- Precio Principal -->
    <div>
      <div class="text-xl font-bold text-slate-900 tracking-tight truncate">
        {{ formatCurrency(asset.price) }}
      </div>
    </div>
  </div>
</template>