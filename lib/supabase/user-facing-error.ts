/** Переводит типичные ответы PostgREST/Supabase на понятное описание для UI. */
export function userFacingSupabaseMessage(raw: string): string {
  const m = raw.toLowerCase()

  if (m.includes('schema cache') || m.includes('could not find')) {
    return 'В облачной базе не хватает таблицы или миграции. Откройте Supabase → SQL Editor и выполните скрипт supabase/schema.sql из проекта.'
  }
  if (m.includes('jwt') || m.includes('invalid refresh token')) {
    return 'Сессия устарела. Выйдите и войдите снова.'
  }
  if (m.includes('failed to fetch') || m.includes('network')) {
    return 'Не удалось связаться с сервером. Проверьте интернет или не стоит ли проект Supabase на паузе.'
  }
  if (m.includes('row-level security') || m.includes('rls')) {
    return 'Доступ к данным запрещён политиками безопасности (RLS). Проверьте настройки в Supabase или что вы вошли в свой аккаунт.'
  }
  return raw.trim() || 'Произошла ошибка при обращении к базе данных.'
}
