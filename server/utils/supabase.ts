/// <reference types="node" />

import { createClient } from '@supabase/supabase-js'

const runtimeConfig = useRuntimeConfig()
const DEFAULT_SUPABASE_URL = 'https://cuevtgcoggtwwgczofen.supabase.co'
const DEFAULT_SUPABASE_KEY = 'sb_publishable_71bukApYMWvk4SaW7bFZmQ_SUKZCZlE'

const cleanConfigValue = (value: unknown) => String(value || '')
  .trim()
  .replace(/^\[|\]$/g, '')
  .replace(/^`|`$/g, '')
  .replace(/^\[[^\]]*\]\(([^)]+)\)$/, '$1')
  .trim()

const normalizeSupabaseUrl = (value: unknown) => {
  const cleanedUrl = cleanConfigValue(value)
  const withProtocol = /^https?:\/\//i.test(cleanedUrl) ? cleanedUrl : `https://${cleanedUrl}`
  try {
    const parsedUrl = new URL(withProtocol)
    if (!['http:', 'https:'].includes(parsedUrl.protocol) || !parsedUrl.hostname) return DEFAULT_SUPABASE_URL
    return parsedUrl.toString().replace(/\/$/, '')
  } catch {
    return DEFAULT_SUPABASE_URL
  }
}

const supabaseUrl = normalizeSupabaseUrl(runtimeConfig.supabaseUrl || DEFAULT_SUPABASE_URL)
const supabaseKey = cleanConfigValue(runtimeConfig.supabaseKey) || DEFAULT_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false }
})

export const BOT_STATE_ID = 1
