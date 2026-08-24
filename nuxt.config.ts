// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    systemPassword: process.env.SYSTEM_PASSWORD || '4B73l1t0b1c01n_',
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || ''
  },
  nitro: {
    storage: {
      'bot-state': {
        driver: 'fs',
        base: './server/data'
      }
    }
  }
})