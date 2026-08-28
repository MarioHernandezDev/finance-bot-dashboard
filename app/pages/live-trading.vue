<script setup lang="ts">
import { SUPPORTED_ASSETS } from '~/types/crypto'

interface RealBalance { asset: string; free: number; locked: number; total: number }
interface RealAccount { configured: boolean; enabled: boolean; balances: RealBalance[]; usdtBalance: number }

const { fetchTicker } = useCryptoApi()
const account = ref<RealAccount | null>(null)
const prices = ref<Record<string, number>>({})
const selectedSymbol = ref('BTCUSDT')
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const symbols = SUPPORTED_ASSETS.map(asset => asset.symbol)
const isReady = computed(() => Boolean(account.value?.enabled))
const selectedAsset = computed(() => account.value?.balances.find(balance => balance.asset === selectedSymbol.value.replace('USDT', '')))

const refreshAccount = async () => {
  isLoading.value = true
  try {
    account.value = await $fetch<RealAccount>('/api/real-account')
    const tickers = await Promise.all(symbols.map(symbol => fetchTicker(symbol)))
    prices.value = Object.fromEntries(tickers.filter(Boolean).map(ticker => [`${ticker!.symbol}USDT`, ticker!.price]))
    errorMessage.value = null
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'No se pudo consultar la cuenta real.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void refreshAccount()
})
</script>

<template>
  <div class="max-w-[1680px] mx-auto space-y-7">
    <div>
      <div class="flex items-center gap-2 mb-3"><span class="w-2 h-2 rounded-full" :class="isReady ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'"></span><span class="text-xs uppercase font-bold" :class="isReady ? 'text-rose-700' : 'text-amber-700'">{{ isReady ? 'Real environment / connected' : 'Real environment / locked' }}</span></div>
      <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-800">Consola de Trading Real</h2>
      <p class="text-xs text-slate-500 mt-1">Operativa Spot de Binance con fondos reales</p>
    </div>

    <div v-if="!isReady" class="bg-white border border-amber-200 rounded-2xl p-6 sm:p-8 text-sm space-y-5 shadow-sm">
      <div class="flex items-center gap-2 text-amber-700 font-bold"><span>⚠️</span><span>Trading real bloqueado por seguridad</span></div>
      <p class="text-slate-600">Configura <strong>BINANCE_API_KEY</strong>, <strong>BINANCE_SECRET_KEY</strong> y <strong>ENABLE_REAL_TRADING=true</strong> en el archivo <strong>.env del servidor</strong>. Las claves nunca se solicitan ni se exponen en el navegador.</p>
      <NuxtLink to="/paper-trading" class="inline-flex bg-slate-900 text-white font-bold px-5 py-2.5 rounded-xl">Ir a Paper Trading</NuxtLink>
      <p v-if="errorMessage" class="text-rose-700">{{ errorMessage }}</p>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div class="bg-white border-2 border-rose-200 rounded-2xl p-6 shadow-sm"><span class="text-sm text-slate-600">USDT Disponible REAL</span><strong class="block mt-3 text-3xl text-slate-900">${{ account?.usdtBalance.toFixed(2) }}</strong></div>
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"><span class="text-sm text-slate-600">Activos con saldo</span><strong class="block mt-3 text-3xl text-slate-900">{{ account?.balances.filter(balance => balance.asset !== 'USDT').length }}</strong></div>
        <div class="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-sm"><span class="text-sm text-rose-700">Protección por orden</span><strong class="block mt-3 text-3xl text-rose-800">10.00 USDT</strong></div>
      </div>

      <div class="flex items-center gap-3 overflow-x-auto pb-2"><button v-for="symbol in symbols" :key="symbol" @click="selectedSymbol = symbol" :class="selectedSymbol === symbol ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-600 border-slate-200'" class="px-5 py-2.5 rounded-full border text-sm font-semibold whitespace-nowrap">{{ symbol.replace('USDT', '') }}/USDT</button></div>
      <RealTradePanel :symbol="selectedSymbol" :current-price="prices[selectedSymbol] || 0" :usdt-balance="account?.usdtBalance || 0" :holding="selectedAsset?.total || 0" @executed="refreshAccount" />

      <section class="bg-white border-2 border-amber-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div class="flex items-center justify-between gap-4"><div><h3 class="text-xl font-semibold text-slate-900">🤖 Bot Automatizado REAL</h3><p class="text-sm text-slate-500 mt-2">Supervisión y ejecución automática con fondos reales</p></div><span class="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-full">REQUIERE ACTIVACIÓN EXPLÍCITA</span></div>
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">El bot real permanece detenido por defecto. Actívalo únicamente después de verificar las claves, permisos Spot y el límite de 10 USDT por orden.</div>
      </section>

      <section class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"><div class="flex items-center justify-between mb-5"><h3 class="text-xl font-semibold text-slate-900">Saldos Spot Binance</h3><button @click="refreshAccount" :disabled="isLoading" class="text-sm font-bold text-sky-700 disabled:opacity-50">{{ isLoading ? 'Actualizando...' : 'Actualizar' }}</button></div><div class="overflow-x-auto"><table class="w-full text-left text-sm"><thead class="text-xs uppercase text-slate-500"><tr><th class="pb-3">Activo</th><th class="pb-3 text-right">Disponible</th><th class="pb-3 text-right">Bloqueado</th><th class="pb-3 text-right">Total</th></tr></thead><tbody><tr v-for="balance in account?.balances" :key="balance.asset" class="border-t border-slate-100"><td class="py-3 font-bold">{{ balance.asset }}</td><td class="py-3 text-right font-mono">{{ balance.free }}</td><td class="py-3 text-right font-mono">{{ balance.locked }}</td><td class="py-3 text-right font-mono">{{ balance.total }}</td></tr></tbody></table></div></section>
    </template>
  </div>
</template>