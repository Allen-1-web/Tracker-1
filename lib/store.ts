'use client'

import { create } from 'zustand'
import { format } from 'date-fns'
import type { Session } from '@supabase/supabase-js'
import type {
  Habit,
  HabitLog,
  Goal,
  GoalProgress,
  User,
  Category,
  FoodItem,
  MealEntry,
  NutritionGoals,
} from './types'
import { getSupabaseBrowserClient } from './supabase/client'
import { fetchUserAppData } from './supabase/maps'
import { userFacingSupabaseMessage } from './supabase/user-facing-error'
import type { Database } from './supabase/database.types'

type DataStatus = 'idle' | 'loading' | 'ready' | 'error'

const SUPABASE_AUTH_TIMEOUT_MS = 30_000
const SUPABASE_DATA_TIMEOUT_MS = 35_000

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), ms)
  })
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId))
}

const defaultNutrition: NutritionGoals = {
  calories: 2200,
  protein: 150,
  fat: 70,
  carbs: 250,
}

const emptyUser: User = {
  id: '',
  name: '',
  email: '',
  telegramConnected: false,
  theme: 'light',
  remindersEnabled: false,
}

function getClient() {
  return getSupabaseBrowserClient()
}

interface AppStore {
  session: Session | null
  authReady: boolean
  dataStatus: DataStatus
  dataError: string | null

  user: User
  habits: Habit[]
  habitLogs: HabitLog[]
  goals: Goal[]
  goalProgress: GoalProgress[]
  categories: Category[]
  foodDatabase: FoodItem[]
  mealEntries: MealEntry[]
  nutritionGoals: NutritionGoals

  initialize: () => Promise<void>
  reloadAppData: (opts?: { withLoading?: boolean }) => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ error?: string; needsEmailConfirmation?: boolean }>
  signOut: () => Promise<void>

  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => Promise<void>
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>
  archiveHabit: (id: string) => Promise<void>
  deleteHabit: (id: string) => Promise<void>
  toggleHabitLog: (habitId: string, date?: string) => Promise<void>

  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => Promise<void>
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  addGoalProgress: (progress: Omit<GoalProgress, 'id'>) => Promise<void>

  updateUser: (updates: Partial<User>) => Promise<void>

  addCategory: (cat: Omit<Category, 'id'>) => Promise<void>
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>

  addMealEntry: (entry: Omit<MealEntry, 'id'>) => Promise<void>
  deleteMealEntry: (id: string) => Promise<void>
  updateNutritionGoals: (goals: Partial<NutritionGoals>) => Promise<void>

  /** Сброс текста мутационной ошибки (баннер в приложении). */
  clearDataError: () => void
}

let authListenerAttached = false

async function runReloadAppData(
  set: (partial: Partial<AppStore>) => void,
  get: () => AppStore,
  opts?: { withLoading?: boolean }
): Promise<void> {
  const withLoading = opts?.withLoading ?? false
  const session = get().session
  if (!session?.user) return
  try {
    const supabase = getClient()
    if (withLoading) set({ dataStatus: 'loading', dataError: null })
    const data = await withTimeout(
      fetchUserAppData(supabase, session.user.id, session.user),
      SUPABASE_DATA_TIMEOUT_MS,
      'Превышено время ожидания ответа от базы. Проверьте интернет, что проект Supabase не на паузе и что SUPABASE_URL без /rest/v1.'
    )
    set({ ...data, dataStatus: 'ready', dataError: null })
  } catch (e) {
    set({
      dataStatus: 'error',
      dataError: userFacingSupabaseMessage(
        e instanceof Error ? e.message : 'Ошибка загрузки данных'
      ),
    })
  }
}

function clearedDataState() {
  return {
    dataStatus: 'idle' as const,
    dataError: null as string | null,
    user: emptyUser,
    habits: [] as Habit[],
    habitLogs: [] as HabitLog[],
    goals: [] as Goal[],
    goalProgress: [] as GoalProgress[],
    categories: [] as Category[],
    foodDatabase: [] as FoodItem[],
    mealEntries: [] as MealEntry[],
    nutritionGoals: defaultNutrition,
  }
}

export const useStore = create<AppStore>((set, get) => ({
  session: null,
  authReady: false,
  dataStatus: 'idle',
  dataError: null,

  user: emptyUser,
  habits: [],
  habitLogs: [],
  goals: [],
  goalProgress: [],
  categories: [],
  foodDatabase: [],
  mealEntries: [],
  nutritionGoals: defaultNutrition,

  initialize: async () => {
    try {
      const supabase = getClient()
      if (!authListenerAttached) {
        authListenerAttached = true
        supabase.auth.onAuthStateChange(async (event, session) => {
          set({ session })
          if (event === 'INITIAL_SESSION') return
          if (!session?.user) {
            set(clearedDataState())
            return
          }
          if (event === 'USER_UPDATED') {
            await get().reloadAppData({ withLoading: false })
            return
          }
          if (event === 'SIGNED_IN') {
            const uid = session.user.id
            queueMicrotask(() => {
              const s = get()
              if (!s.session?.user || s.session.user.id !== uid) return
              if (s.dataStatus === 'loading') return
              if (s.dataStatus === 'ready' && s.user.id === uid) return
              void s.reloadAppData({ withLoading: true })
            })
          }
        })
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()
      set({ session, authReady: true })

      if (!session?.user) {
        set(clearedDataState())
      } else {
        await get().reloadAppData({ withLoading: true })
      }
    } catch (e) {
      set({
        authReady: true,
        dataStatus: 'error',
        dataError: userFacingSupabaseMessage(
          e instanceof Error ? e.message : 'Не удалось подключиться к Supabase'
        ),
      })
    }
  },

  reloadAppData: async (opts) => {
    const session = get().session
    if (!session?.user) return
    await runReloadAppData(set, get, opts)
  },

  signIn: async (email, password) => {
    try {
      const supabase = getClient()
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        SUPABASE_AUTH_TIMEOUT_MS,
        'Сервер входа не ответил вовремя. Проверьте интернет и что в .env.local указан верный SUPABASE_URL (без /rest/v1).'
      )
      if (error) return { error: userFacingSupabaseMessage(error.message) }
      const session = data.session
      set({ session: session ?? null })
      if (session?.user) {
        await get().reloadAppData({ withLoading: true })
        if (get().dataStatus === 'error') {
          return {
            error:
              get().dataError ??
              'Не удалось загрузить данные. Проверьте, что в Supabase выполнен supabase/schema.sql.',
          }
        }
      }
      return {}
    } catch (e) {
      return { error: userFacingSupabaseMessage(e instanceof Error ? e.message : 'Ошибка входа') }
    }
  },

  signUp: async (name, email, password) => {
    try {
      const supabase = getClient()
      const { data, error } = await withTimeout(
        supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        }),
        SUPABASE_AUTH_TIMEOUT_MS,
        'Сервер регистрации не ответил вовремя. Проверьте интернет и SUPABASE_URL (без /rest/v1).'
      )
      if (error) return { error: userFacingSupabaseMessage(error.message) }
      if (data.user && !data.session) return { needsEmailConfirmation: true }
      const session = data.session
      if (session?.user) {
        set({ session })
        await get().reloadAppData({ withLoading: true })
        if (get().dataStatus === 'error') {
          return {
            error:
              get().dataError ??
              'Не удалось загрузить данные. Проверьте, что в Supabase выполнен supabase/schema.sql.',
          }
        }
      }
      return {}
    } catch (e) {
      return { error: userFacingSupabaseMessage(e instanceof Error ? e.message : 'Ошибка регистрации') }
    }
  },

  signOut: async () => {
    const supabase = getClient()
    await supabase.auth.signOut()
  },

  clearDataError: () => set({ dataError: null }),

  addHabit: async (habit) => {
    const session = get().session
    if (!session?.user) return
    const supabase = getClient()
    const insert: Database['public']['Tables']['habits']['Insert'] = {
      user_id: session.user.id,
      name: habit.name,
      icon: habit.icon,
      color: habit.color,
      category: habit.category,
      frequency: habit.frequency as Database['public']['Tables']['habits']['Insert']['frequency'],
      is_archived: habit.isArchived,
    }
    const { error } = await supabase.from('habits').insert(insert)
    if (error) {
      set({ dataError: userFacingSupabaseMessage(error.message) })
      return
    }
    await get().reloadAppData()
  },

  updateHabit: async (id, updates) => {
    const supabase = getClient()
    const patch: Database['public']['Tables']['habits']['Update'] = {}
    if (updates.name !== undefined) patch.name = updates.name
    if (updates.icon !== undefined) patch.icon = updates.icon
    if (updates.color !== undefined) patch.color = updates.color
    if (updates.category !== undefined) patch.category = updates.category
    if (updates.frequency !== undefined) {
      patch.frequency = updates.frequency as Database['public']['Tables']['habits']['Update']['frequency']
    }
    if (updates.isArchived !== undefined) patch.is_archived = updates.isArchived
    const { error } = await supabase.from('habits').update(patch).eq('id', id)
    if (error) {
      set({ dataError: userFacingSupabaseMessage(error.message) })
      return
    }
    await get().reloadAppData()
  },

  archiveHabit: async (id) => {
    const supabase = getClient()
    const { error } = await supabase.from('habits').update({ is_archived: true }).eq('id', id)
    if (error) {
      set({ dataError: userFacingSupabaseMessage(error.message) })
      return
    }
    await get().reloadAppData()
  },

  deleteHabit: async (id) => {
    const supabase = getClient()
    const { error } = await supabase.from('habits').delete().eq('id', id)
    if (error) {
      set({ dataError: userFacingSupabaseMessage(error.message) })
      return
    }
    await get().reloadAppData()
  },

  toggleHabitLog: async (habitId, date) => {
    const session = get().session
    if (!session?.user) return
    const dateStr = date ?? format(new Date(), 'yyyy-MM-dd')
    const supabase = getClient()
    const { data: existing } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', habitId)
      .eq('log_date', dateStr)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from('habit_logs')
        .update({ completed: !existing.completed })
        .eq('habit_id', habitId)
        .eq('log_date', dateStr)
      if (error) {
        set({ dataError: userFacingSupabaseMessage(error.message) })
        return
      }
    } else {
      const { error } = await supabase.from('habit_logs').insert({
        habit_id: habitId,
        user_id: session.user.id,
        log_date: dateStr,
        completed: true,
      })
      if (error) {
        set({ dataError: userFacingSupabaseMessage(error.message) })
        return
      }
    }
    await get().reloadAppData()
  },

  addGoal: async (goal) => {
    const session = get().session
    if (!session?.user) return
    const supabase = getClient()
    const { error } = await supabase.from('goals').insert({
      user_id: session.user.id,
      name: goal.name,
      description: goal.description ?? null,
      type: goal.type,
      target_value: goal.targetValue,
      current_value: goal.currentValue,
      unit: goal.unit ?? null,
      deadline: format(goal.deadline, 'yyyy-MM-dd'),
      category: goal.category,
      linked_habit_ids: goal.linkedHabitIds,
    })
    if (error) {
      set({ dataError: userFacingSupabaseMessage(error.message) })
      return
    }
    await get().reloadAppData()
  },

  updateGoal: async (id, updates) => {
    const supabase = getClient()
    const patch: Database['public']['Tables']['goals']['Update'] = {}
    if (updates.name !== undefined) patch.name = updates.name
    if (updates.description !== undefined) patch.description = updates.description ?? null
    if (updates.type !== undefined) patch.type = updates.type
    if (updates.targetValue !== undefined) patch.target_value = updates.targetValue
    if (updates.currentValue !== undefined) patch.current_value = updates.currentValue
    if (updates.unit !== undefined) patch.unit = updates.unit ?? null
    if (updates.deadline !== undefined) patch.deadline = format(updates.deadline, 'yyyy-MM-dd')
    if (updates.category !== undefined) patch.category = updates.category
    if (updates.linkedHabitIds !== undefined) patch.linked_habit_ids = updates.linkedHabitIds
    const { error } = await supabase.from('goals').update(patch).eq('id', id)
    if (error) {
      set({ dataError: userFacingSupabaseMessage(error.message) })
      return
    }
    await get().reloadAppData()
  },

  deleteGoal: async (id) => {
    const supabase = getClient()
    const { error } = await supabase.from('goals').delete().eq('id', id)
    if (error) {
      set({ dataError: userFacingSupabaseMessage(error.message) })
      return
    }
    await get().reloadAppData()
  },

  addGoalProgress: async (progress) => {
    const session = get().session
    if (!session?.user) return
    const supabase = getClient()
    const { error: insErr } = await supabase.from('goal_progress').insert({
      user_id: session.user.id,
      goal_id: progress.goalId,
      progress_date: format(progress.date, 'yyyy-MM-dd'),
      value: progress.value,
      note: progress.note ?? null,
    })
    if (insErr) {
      set({ dataError: userFacingSupabaseMessage(insErr.message) })
      return
    }
    const { error: updErr } = await supabase
      .from('goals')
      .update({ current_value: progress.value })
      .eq('id', progress.goalId)
    if (updErr) {
      set({ dataError: userFacingSupabaseMessage(updErr.message) })
      return
    }
    await get().reloadAppData()
  },

  updateUser: async (updates) => {
    const session = get().session
    if (!session?.user) return
    const supabase = getClient()
    const patch: Database['public']['Tables']['profiles']['Update'] = {}
    if (updates.name !== undefined) patch.name = updates.name
    if (updates.email !== undefined) patch.email = updates.email
    if (updates.avatarUrl !== undefined) patch.avatar_url = updates.avatarUrl ?? null
    if (updates.telegramConnected !== undefined) patch.telegram_connected = updates.telegramConnected
    if (updates.telegramUsername !== undefined) patch.telegram_username = updates.telegramUsername ?? null
    if (updates.theme !== undefined) patch.theme = updates.theme
    if (updates.reminderTime !== undefined) patch.reminder_time = updates.reminderTime ?? null
    if (updates.remindersEnabled !== undefined) patch.reminders_enabled = updates.remindersEnabled
    const { error } = await supabase.from('profiles').update(patch).eq('id', session.user.id)
    if (error) {
      set({ dataError: userFacingSupabaseMessage(error.message) })
      return
    }
    set((state) => ({ user: { ...state.user, ...updates } }))
    await get().reloadAppData()
  },

  addCategory: async (cat) => {
    const session = get().session
    if (!session?.user) return
    const supabase = getClient()
    const { error } = await supabase.from('categories').insert({
      user_id: session.user.id,
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
    })
    if (error) {
      set({ dataError: userFacingSupabaseMessage(error.message) })
      return
    }
    await get().reloadAppData()
  },

  updateCategory: async (id, updates) => {
    const supabase = getClient()
    const patch: Database['public']['Tables']['categories']['Update'] = {}
    if (updates.name !== undefined) patch.name = updates.name
    if (updates.color !== undefined) patch.color = updates.color
    if (updates.icon !== undefined) patch.icon = updates.icon
    const { error } = await supabase.from('categories').update(patch).eq('id', id)
    if (error) {
      set({ dataError: userFacingSupabaseMessage(error.message) })
      return
    }
    await get().reloadAppData()
  },

  deleteCategory: async (id) => {
    const supabase = getClient()
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) {
      set({ dataError: userFacingSupabaseMessage(error.message) })
      return
    }
    await get().reloadAppData()
  },

  addMealEntry: async (entry) => {
    const session = get().session
    if (!session?.user) return
    const supabase = getClient()
    const { error } = await supabase.from('meal_entries').insert({
      user_id: session.user.id,
      food_id: entry.foodId,
      entry_date: entry.date,
      meal_type: entry.mealType,
      amount: entry.amount,
      calories: entry.calories,
      protein: entry.protein,
      fat: entry.fat,
      carbs: entry.carbs,
    })
    if (error) {
      set({ dataError: userFacingSupabaseMessage(error.message) })
      return
    }
    await get().reloadAppData()
  },

  deleteMealEntry: async (id) => {
    const supabase = getClient()
    const { error } = await supabase.from('meal_entries').delete().eq('id', id)
    if (error) {
      set({ dataError: userFacingSupabaseMessage(error.message) })
      return
    }
    await get().reloadAppData()
  },

  updateNutritionGoals: async (goals) => {
    const session = get().session
    if (!session?.user) return
    const supabase = getClient()
    const merged = { ...get().nutritionGoals, ...goals }
    const { error } = await supabase.from('nutrition_goals').upsert({
      user_id: session.user.id,
      calories: merged.calories,
      protein: merged.protein,
      fat: merged.fat,
      carbs: merged.carbs,
    })
    if (error) {
      set({ dataError: userFacingSupabaseMessage(error.message) })
      return
    }
    await get().reloadAppData()
  },
}))
