<!-- pages/live-trading.vue -->
<script setup lang="ts">
// Esta vista se conectará a Binance API con saldo real de 10€
const apiKey = ref('')
const apiSecret = ref('')
const isConnected = ref(false)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-lg font-bold text-white">Consola de Trading Real</h2>
      <p class="text-xs text-slate-400">Operativa automatizada con fondos reales (Binance API)</p>
    </div>

    <!-- Banner de Advertencia / Seguridad -->
    <div v-if="!isConnected" class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-xs font-mono space-y-3">
      <div class="flex items-center gap-2 text-amber-400 font-bold">
        <span>⚠️</span>
        <span>Modo Dinero Real (Recomendado iniciar con 10 €)</span>
      </div>
      <p class="text-slate-300">
        Para operar con dinero real necesitas ingresar tus claves API de Binance. Se recomienda usar primero el entorno de <NuxtLink to="/paper-trading" class="text-brand-primary underline">Paper Trading (Demo)</NuxtLink> hasta dominar la estrategia.
      </p>
      
      <div class="flex items-center gap-2 pt-2">
        <input 
          v-model="apiKey"
          type="password" 
          placeholder="API Key de Binance" 
          class="bg-dark-bg border border-dark-border rounded px-3 py-1.5 text-xs text-white w-full focus:outline-none"
        />
        <input 
          v-model="apiSecret"
          type="password" 
          placeholder="API Secret" 
          class="bg-dark-bg border border-dark-border rounded px-3 py-1.5 text-xs text-white w-full focus:outline-none"
        />
        <button 
          @click="isConnected = true"
          class="bg-brand-primary hover:bg-brand-primary/80 text-white font-bold px-4 py-1.5 rounded transition-all whitespace-nowrap"
        >
          Conectar
        </button>
      </div>
    </div>
  </div>
</template>