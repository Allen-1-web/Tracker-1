import type { SupabaseClient, User as AuthUser } from '@supabase/supabase-js'
import type {
  Category,
  FoodItem,
  Goal,
  GoalProgress,
  Habit,
  HabitFrequency,
  HabitLog,
  MealEntry,
  NutritionGoals,
  User,
} from '@/lib/types'
import type { Database, Json } from '@/lib/supabase/database.types'

function parseFrequency(raw: Json): HabitFrequency {
  if (raw === 'daily') return 'daily'
  if (Array.isArray(raw) && raw.every((x) => typeof x === 'number')) return raw as number[]
  return 'daily'
}

export function mapHabitRow(
  r: Database['public']['Tables']['habits']['Row']
): Habit {
  return {
    id: r.id,
    name: r.name,
    icon: r.icon,
    color: r.color,
    category: r.category,
    frequency: parseFrequency(r.frequency),
    createdAt: new Date(r.created_at),
    isArchived: r.is_archived,
  }
}

export function mapHabitLogRow(
  r: Database['public']['Tables']['habit_logs']['Row']
): HabitLog {
  return {
    habitId: r.habit_id,
    date: r.log_date,
    completed: r.completed,
  }
}

export function mapCategoryRow(
  r: Database['public']['Tables']['categories']['Row']
): Category {
  return {
    id: r.id,
    name: r.name,
    color: r.color,
    icon: r.icon,
  }
}

export function mapGoalRow(r: Database['public']['Tables']['goals']['Row']): Goal {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? undefined,
    type: r.type as Goal['type'],
    targetValue: Number(r.target_value),
    currentValue: Number(r.current_value),
    unit: r.unit ?? undefined,
    deadline: new Date(r.deadline + 'T12:00:00'),
    category: r.category,
    linkedHabitIds: r.linked_habit_ids ?? [],
    createdAt: new Date(r.created_at),
  }
}

export function mapGoalProgressRow(
  r: Database['public']['Tables']['goal_progress']['Row']
): GoalProgress {
  return {
    id: r.id,
    goalId: r.goal_id,
    date: new Date(r.progress_date + 'T12:00:00'),
    value: Number(r.value),
    note: r.note ?? undefined,
  }
}

export function mapFoodRow(r: Database['public']['Tables']['food_items']['Row']): FoodItem {
  return {
    id: r.id,
    name: r.name,
    calories: Number(r.calories),
    protein: Number(r.protein),
    fat: Number(r.fat),
    carbs: Number(r.carbs),
    category: r.category as FoodItem['category'],
  }
}

export function mapMealRow(
  r: Database['public']['Tables']['meal_entries']['Row']
): MealEntry {
  return {
    id: r.id,
    foodId: r.food_id,
    date: r.entry_date,
    mealType: r.meal_type as MealEntry['mealType'],
    amount: Number(r.amount),
    calories: Number(r.calories),
    protein: Number(r.protein),
    fat: Number(r.fat),
    carbs: Number(r.carbs),
  }
}

export function mapNutritionRow(
  r: Database['public']['Tables']['nutrition_goals']['Row']
): NutritionGoals {
  return {
    calories: Number(r.calories),
    protein: Number(r.protein),
    fat: Number(r.fat),
    carbs: Number(r.carbs),
  }
}

export function mapProfileToUser(
  profile: Database['public']['Tables']['profiles']['Row'] | null,
  sessionUser: AuthUser
): User {
  const meta = sessionUser.user_metadata as { full_name?: string } | undefined
  return {
    id: sessionUser.id,
    name: profile?.name ?? meta?.full_name ?? sessionUser.email?.split('@')[0] ?? 'Пользователь',
    email: sessionUser.email ?? profile?.email ?? '',
    avatarUrl: profile?.avatar_url ?? undefined,
    telegramConnected: profile?.telegram_connected ?? false,
    telegramUsername: profile?.telegram_username ?? undefined,
    theme: (profile?.theme as User['theme']) ?? 'light',
    reminderTime: profile?.reminder_time ?? undefined,
    remindersEnabled: profile?.reminders_enabled ?? true,
  }
}

export async function fetchUserAppData(
  supabase: SupabaseClient,
  userId: string,
  sessionUser: AuthUser
) {
  const [
    profileRes,
    habitsRes,
    logsRes,
    goalsRes,
    gpRes,
    catRes,
    foodRes,
    mealsRes,
    nutRes,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('habits').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('habit_logs').select('*').eq('user_id', userId),
    supabase.from('goals').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('goal_progress').select('*').eq('user_id', userId).order('progress_date', { ascending: false }),
    supabase.from('categories').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('food_items').select('*').order('name'),
    supabase.from('meal_entries').select('*').eq('user_id', userId).order('entry_date', { ascending: false }),
    supabase.from('nutrition_goals').select('*').eq('user_id', userId).maybeSingle(),
  ])

  const errors = [
    profileRes.error,
    habitsRes.error,
    logsRes.error,
    goalsRes.error,
    gpRes.error,
    catRes.error,
    foodRes.error,
    mealsRes.error,
    nutRes.error,
  ].filter(Boolean)
  if (errors.length > 0) {
    throw new Error(errors[0]!.message)
  }

  const habits = (habitsRes.data ?? []).map(mapHabitRow)
  const habitLogs = (logsRes.data ?? []).map(mapHabitLogRow)
  const goals = (goalsRes.data ?? []).map(mapGoalRow)
  const goalProgress = (gpRes.data ?? []).map(mapGoalProgressRow)
  const categories = (catRes.data ?? []).map(mapCategoryRow)
  const foodDatabase = (foodRes.data ?? []).map(mapFoodRow)
  const mealEntries = (mealsRes.data ?? []).map(mapMealRow)

  const defaultNutrition: NutritionGoals = {
    calories: 2200,
    protein: 150,
    fat: 70,
    carbs: 250,
  }
  const nutritionGoals = nutRes.data ? mapNutritionRow(nutRes.data) : defaultNutrition

  const user = mapProfileToUser(profileRes.data ?? null, sessionUser)

  return {
    user,
    habits,
    habitLogs,
    goals,
    goalProgress,
    categories,
    foodDatabase,
    mealEntries,
    nutritionGoals,
  }
}
