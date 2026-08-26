<!-- pages/live-trading.vue -->
<script setup lang="ts">
// Esta vista se conectará a Binance API con saldo real de 10€
const apiKey = ref('')
const apiSecret = ref('')
const isConnected = ref(false)
</script>

<template>
  <div class="max-w-[1680px] mx-auto space-y-7">
    <div>
      <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-800">Consola de Trading Real</h2>
      <p class="text-xs text-slate-500 mt-1">Operativa automatizada con fondos reales (Binance API)</p>
    </div>

    <!-- Banner de Advertencia / Seguridad -->
    <div v-if="!isConnected" class="bg-white border border-amber-100 rounded-2xl p-6 sm:p-8 text-sm space-y-5 shadow-sm">
      <div class="flex items-center gap-2 text-amber-600 font-bold">
        <span>⚠️</span>
        <span>Modo Dinero Real (Recomendado iniciar con 10 €)</span>
      </div>
      <p class="text-slate-300">
        Para operar con dinero real necesitas ingresar tus claves API de Binance. Se recomienda usar primero el entorno de <NuxtLink to="/paper-trading" class="text-sky-600 underline">Paper Trading (Demo)</NuxtLink> hasta dominar la estrategia.
      </p>
      
      <div class="flex items-center gap-2 pt-2">
        <input 
          v-model="apiKey"
          type="password" 
          placeholder="API Key de Binance" 
          class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 w-full focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
        <input 
          v-model="apiSecret"
          type="password" 
          placeholder="API Secret" 
          class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 w-full focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
        <button 
          @click="isConnected = true"
          class="bg-sky-500 hover:bg-sky-400 text-white font-bold px-5 py-2.5 rounded-full transition-all whitespace-nowrap shadow-md shadow-sky-200"
        >
          Conectar
        </button>
      </div>
    </div>
  </div>
</template>