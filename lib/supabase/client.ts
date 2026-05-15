import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null

/** Project URL из дашборда — только хост, без /rest/v1 и без хвостового слеша. */
function normalizeSupabaseUrl(raw: string): string {
  let u = raw.trim()
  if ((u.startsWith('"') && u.endsWith('"')) || (u.startsWith("'") && u.endsWith("'"))) {
    u = u.slice(1, -1).trim()
  }
  u = u.replace(/\/+$/, '')
  const restPath = '/rest/v1'
  if (u.endsWith(restPath)) {
    u = u.slice(0, -restPath.length).replace(/\/+$/, '')
  }
  try {
    new URL(u)
  } catch {
    throw new Error('Некорректный SUPABASE_URL. Ожидается вид: https://xxxx.supabase.co (без /rest/v1).')
  }
  return u
}

export function getSupabaseBrowserClient(): SupabaseClient {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!rawUrl || !key) {
    throw new Error(
      'Задайте SUPABASE_URL и SUPABASE_ANON_KEY в .env.local (см. README). Для Next.js они пробрасываются через next.config.ts.'
    )
  }
  const url = normalizeSupabaseUrl(rawUrl)
  if (!browserClient) {
    browserClient = createClient(url, key.trim())
  }
  return browserClient
}

export type { Database } from './database.types'
