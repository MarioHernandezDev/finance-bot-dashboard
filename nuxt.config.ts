// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    systemPassword: process.env.SYSTEM_PASSWORD || '4B73l1t0b1c01n_',
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
    binanceApiKey: process.env.BINANCE_API_KEY || '',
    binanceSecretKey: process.env.BINANCE_SECRET_KEY || '',
    enableRealTrading: process.env.ENABLE_REAL_TRADING === 'true',
    supabaseUrl: process.env.SUPABASE_URL || 'https://cuevtgcoggtwwgczofen.supabase.co',
    supabaseKey: process.env.SUPABASE_KEY || 'sb_publishable_71bukApYMWvk4SaW7bFZmQ_SUKZCZlE'
  }
})