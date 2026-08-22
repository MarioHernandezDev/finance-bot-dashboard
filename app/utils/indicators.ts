// utils/indicators.ts
import type { CandlestickData } from 'lightweight-charts'

/**
 * Calcula la Media Móvil Simple (SMA) para un período dado
 */
export const calculateSMA = (data: CandlestickData[], period: number = 20) => {
  const smaData: { time: any; value: number }[] = []

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1)
    const sum = slice.reduce((acc, curr) => acc + curr.close, 0)
    smaData.push({
      time: data[i].time,
      value: sum / period
    })
  }

  return smaData
}

/**
 * Calcula el Índice de Fuerza Relativa (RSI 14)
 */
export const calculateRSI = (data: CandlestickData[], period: number = 14) => {
  if (data.length <= period) return []

  const rsiData: { time: any; value: number }[] = []
  let gains = 0
  let losses = 0

  // Primer promedio de ganancias/pérdidas
  for (let i = 1; i <= period; i++) {
    const change = data[i].close - data[i - 1].close
    if (change >= 0) gains += change
    else losses += Math.abs(change)
  }

  let avgGain = gains / period
  let avgLoss = losses / period

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss
  let rsi = 100 - 100 / (1 + rs)

  rsiData.push({ time: data[period].time, value: rsi })

  // Cálculo suavizado (Wilder's Smoothing)
  for (let i = period + 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close
    const gain = change >= 0 ? change : 0
    const loss = change < 0 ? Math.abs(change) : 0

    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss
    rsi = 100 - 100 / (1 + rs)

    rsiData.push({
      time: data[i].time,
      value: rsi
    })
  }

  return rsiData
}