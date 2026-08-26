/// <reference types="node" />

import { createClient } from '@supabase/supabase-js'

const runtimeConfig = useRuntimeConfig()
const supabaseUrl = runtimeConfig.supabaseUrl
const supabaseKey = runtimeConfig.supabaseKey

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false }
})

export const BOT_STATE_ID = 1
