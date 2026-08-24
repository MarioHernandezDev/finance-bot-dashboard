interface TelegramResponse {
  ok: boolean
  description?: string
}

export const sendTelegramAlert = async (message: string): Promise<boolean> => {
  const config = useRuntimeConfig()
  const token = config.telegramBotToken
  const chatId = config.telegramChatId

  if (!token || !chatId) {
    console.warn('Alertas de Telegram no configuradas: faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID.')
    return false
  }

  try {
    const response = await $fetch<TelegramResponse>(`https://api.telegram.org/bot${encodeURIComponent(token)}/sendMessage`, {
      method: 'POST',
      body: { chat_id: chatId, text: message, parse_mode: 'Markdown' },
      timeout: 5000
    })
    if (!response.ok) {
      console.error(`Telegram rechazó la alerta: ${response.description || 'respuesta no válida'}`)
      return false
    }
    return true
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Error de red'
    console.error(`No se pudo enviar la alerta de Telegram: ${reason}`)
    return false
  }
}