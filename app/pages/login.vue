<script setup lang="ts">
definePageMeta({ layout: false })

const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const isAuthenticated = useState('is-authenticated', () => false)

const login = async () => {
  if (loading.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    await $fetch('/api/login', {
      method: 'POST',
      body: { password: password.value }
    })

    isAuthenticated.value = true
    await navigateTo('/paper-trading')
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.data?.statusMessage || 'No se pudo iniciar sesión. Inténtalo de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 text-slate-800">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(186,230,253,0.5),_transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(167,243,208,0.35),_transparent_34%)]" />

    <section class="relative w-full max-w-md rounded-2xl border border-slate-200/60 bg-white/90 p-8 shadow-sm backdrop-blur-xl sm:p-10">
      <div class="mb-8 flex items-center gap-3">
        <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-xl font-bold text-white shadow-lg shadow-emerald-200">₿</div>
        <div>
          <p class="text-sm font-bold tracking-wide text-slate-800">CryptoBot</p>
          <p class="text-xs uppercase tracking-tight text-slate-500">Acceso privado</p>
        </div>
      </div>

      <div class="mb-7">
        <h1 class="text-2xl font-bold text-slate-800">Bienvenido de nuevo</h1>
        <p class="mt-2 text-sm text-slate-500">Introduce tu contraseña para acceder a la consola de trading.</p>
      </div>

      <form class="space-y-5" @submit.prevent="login">
        <div>
          <label for="password" class="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Contraseña</label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              autofocus
              required
              class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              placeholder="Escribe tu contraseña"
            >
            <button
              type="button"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-emerald-600"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
        </div>

        <p v-if="errorMessage" role="alert" class="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="flex w-full items-center justify-center rounded-2xl border border-emerald-400 bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span v-if="loading" class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          {{ loading ? 'Verificando...' : 'Entrar en la consola' }}
        </button>
      </form>
    </section>
  </main>
</template>