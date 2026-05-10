import { subDays, format } from 'date-fns'
import type { Habit, HabitLog, Goal, GoalProgress, User, Category, HabitStats, FoodItem, MealEntry, NutritionGoals } from './types'

export const mockUser: User = {
  id: 'user-1',
  name: 'Алексей',
  email: 'alexey@example.com',
  avatarUrl: undefined,
  telegramConnected: false,
  theme: 'light',
  reminderTime: '09:00',
  remindersEnabled: true,
}

export const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Здоровье', color: '#22c55e', icon: '💪' },
  { id: 'cat-2', name: 'Спорт', color: '#3b82f6', icon: '🏃' },
  { id: 'cat-3', name: 'Образование', color: '#a855f7', icon: '📚' },
  { id: 'cat-4', name: 'Продуктивность', color: '#f59e0b', icon: '⚡' },
  { id: 'cat-5', name: 'Отдых', color: '#ec4899', icon: '🧘' },
  { id: 'cat-6', name: 'Финансы', color: '#14b8a6', icon: '💰' },
]

export const mockHabits: Habit[] = [
  {
    id: 'habit-1',
    name: 'Утренняя зарядка',
    icon: '🏋️',
    color: '#3b82f6',
    category: 'Спорт',
    frequency: 'daily',
    createdAt: subDays(new Date(), 90),
    isArchived: false,
  },
  {
    id: 'habit-2',
    name: 'Читать 30 минут',
    icon: '📖',
    color: '#a855f7',
    category: 'Образование',
    frequency: 'daily',
    createdAt: subDays(new Date(), 60),
    isArchived: false,
  },
  {
    id: 'habit-3',
    name: 'Пить 2л воды',
    icon: '💧',
    color: '#22c55e',
    category: 'Здоровье',
    frequency: 'daily',
    createdAt: subDays(new Date(), 45),
    isArchived: false,
  },
  {
    id: 'habit-4',
    name: 'Медитация',
    icon: '🧘',
    color: '#ec4899',
    category: 'Отдых',
    frequency: 'daily',
    createdAt: subDays(new Date(), 30),
    isArchived: false,
  },
  {
    id: 'habit-5',
    name: 'Учить английский',
    icon: '🇬🇧',
    color: '#f59e0b',
    category: 'Образование',
    frequency: [1, 2, 3, 4, 5], // Пн-Пт
    createdAt: subDays(new Date(), 20),
    isArchived: false,
  },
  {
    id: 'habit-6',
    name: 'Бег',
    icon: '🏃',
    color: '#14b8a6',
    category: 'Спорт',
    frequency: [1, 3, 5], // Пн, Ср, Пт
    createdAt: subDays(new Date(), 50),
    isArchived: false,
  },
]

function generateLogs(habitId: string, daysBack: number, completionRate: number): HabitLog[] {
  const logs: HabitLog[] = []
  for (let i = 0; i < daysBack; i++) {
    const date = subDays(new Date(), i)
    const completed = Math.random() < completionRate
    logs.push({
      habitId,
      date: format(date, 'yyyy-MM-dd'),
      completed,
    })
  }
  return logs
}

export const mockHabitLogs: HabitLog[] = [
  ...generateLogs('habit-1', 90, 0.82),
  ...generateLogs('habit-2', 60, 0.75),
  ...generateLogs('habit-3', 45, 0.90),
  ...generateLogs('habit-4', 30, 0.60),
  ...generateLogs('habit-5', 20, 0.70),
  ...generateLogs('habit-6', 50, 0.65),
  // Сегодня habit-1 и habit-3 выполнены
  { habitId: 'habit-1', date: format(new Date(), 'yyyy-MM-dd'), completed: true },
  { habitId: 'habit-3', date: format(new Date(), 'yyyy-MM-dd'), completed: true },
]

export const mockHabitStats: HabitStats[] = [
  { habitId: 'habit-1', currentStreak: 12, bestStreak: 21, completionRate30: 83, completionRate90: 82, totalCompleted: 74 },
  { habitId: 'habit-2', currentStreak: 5, bestStreak: 18, completionRate30: 77, completionRate90: 75, totalCompleted: 45 },
  { habitId: 'habit-3', currentStreak: 8, bestStreak: 15, completionRate30: 90, completionRate90: 90, totalCompleted: 41 },
  { habitId: 'habit-4', currentStreak: 3, bestStreak: 10, completionRate30: 60, completionRate90: 60, totalCompleted: 18 },
  { habitId: 'habit-5', currentStreak: 4, bestStreak: 8, completionRate30: 70, completionRate90: 70, totalCompleted: 14 },
  { habitId: 'habit-6', currentStreak: 2, bestStreak: 12, completionRate30: 67, completionRate90: 65, totalCompleted: 33 },
]

export const mockGoals: Goal[] = [
  {
    id: 'goal-1',
    name: 'Пробежать 100 км',
    description: 'Суммарный километраж за год',
    type: 'numeric',
    targetValue: 100,
    currentValue: 47,
    unit: 'км',
    deadline: new Date('2026-12-31'),
    category: 'Спорт',
    linkedHabitIds: ['habit-6'],
    createdAt: subDays(new Date(), 120),
  },
  {
    id: 'goal-2',
    name: 'Прочитать 20 книг',
    description: 'Книги за год',
    type: 'numeric',
    targetValue: 20,
    currentValue: 8,
    unit: 'книг',
    deadline: new Date('2026-12-31'),
    category: 'Образование',
    linkedHabitIds: ['habit-2'],
    createdAt: subDays(new Date(), 100),
  },
  {
    id: 'goal-3',
    name: 'Выучить 500 слов',
    description: 'Словарный запас английского',
    type: 'numeric',
    targetValue: 500,
    currentValue: 210,
    unit: 'слов',
    deadline: new Date('2026-09-01'),
    category: 'Образование',
    linkedHabitIds: ['habit-5'],
    createdAt: subDays(new Date(), 60),
  },
  {
    id: 'goal-4',
    name: 'Ни одного пропуска зарядки',
    description: '90 дней без пропусков',
    type: 'numeric',
    targetValue: 90,
    currentValue: 12,
    unit: 'дней',
    deadline: new Date('2026-08-07'),
    category: 'Спорт',
    linkedHabitIds: ['habit-1'],
    createdAt: subDays(new Date(), 12),
  },
]

export const mockGoalProgress: GoalProgress[] = [
  { id: 'gp-1', goalId: 'goal-1', date: subDays(new Date(), 5), value: 42, note: 'Пробежал 5 км' },
  { id: 'gp-2', goalId: 'goal-1', date: subDays(new Date(), 3), value: 45, note: 'Утренняя пробежка 3 км' },
  { id: 'gp-3', goalId: 'goal-1', date: subDays(new Date(), 1), value: 47, note: 'Пробежал 2 км' },
  { id: 'gp-4', goalId: 'goal-2', date: subDays(new Date(), 10), value: 6, note: 'Дочитал "Атомные привычки"' },
  { id: 'gp-5', goalId: 'goal-2', date: subDays(new Date(), 2), value: 8, note: 'Прочитал "Думай медленно, решай быстро"' },
  { id: 'gp-6', goalId: 'goal-3', date: subDays(new Date(), 7), value: 180, note: 'Выучил 30 новых слов' },
  { id: 'gp-7', goalId: 'goal-3', date: subDays(new Date(), 4), value: 210, note: 'Ещё 30 слов' },
]

export const motivationalQuotes = [
  'Маленькие шаги каждый день приводят к большим переменам.',
  'Дисциплина — это мост между целями и достижениями.',
  'Привычки формируют характер, характер формирует судьбу.',
  'Не нужно быть великим, чтобы начать. Но нужно начать, чтобы стать великим.',
  'Каждый день — это новая возможность стать лучше.',
]

export function getTodayHabits(): Habit[] {
  const today = new Date().getDay()
  return mockHabits.filter((h) => {
    if (h.isArchived) return false
    if (h.frequency === 'daily') return true
    if (Array.isArray(h.frequency)) return h.frequency.includes(today)
    return false
  })
}

export function getHabitCompletedToday(habitId: string): boolean {
  const today = format(new Date(), 'yyyy-MM-dd')
  return mockHabitLogs.some((log) => log.habitId === habitId && log.date === today && log.completed)
}

export function getHabitLogsForRange(habitId: string, days: number): HabitLog[] {
  const logs: HabitLog[] = []
  for (let i = 0; i < days; i++) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
    const log = mockHabitLogs.find((l) => l.habitId === habitId && l.date === date)
    if (log) {
      logs.push(log)
    } else {
      logs.push({ habitId, date, completed: false })
    }
  }
  return logs.reverse()
}

// ─── Nutrition mock data ──────────────────────────────────────────────────────

export const mockFoodDatabase: FoodItem[] = [
  // Белки
  { id: 'food-1',  name: 'Куриная грудка (варёная)',  calories: 165, protein: 31, fat: 3.6, carbs: 0,   category: 'proteins' },
  { id: 'food-2',  name: 'Яйцо куриное',               calories: 155, protein: 13, fat: 11,  carbs: 1.1, category: 'proteins' },
  { id: 'food-3',  name: 'Лосось (запечённый)',         calories: 208, protein: 20, fat: 13,  carbs: 0,   category: 'proteins' },
  { id: 'food-4',  name: 'Говядина (тушёная)',          calories: 218, protein: 26, fat: 12,  carbs: 0,   category: 'proteins' },
  { id: 'food-5',  name: 'Тунец (консервированный)',    calories: 116, protein: 26, fat: 1,   carbs: 0,   category: 'proteins' },
  { id: 'food-6',  name: 'Творог 5%',                   calories: 121, protein: 17, fat: 5,   carbs: 3,   category: 'dairy' },
  // Злаки
  { id: 'food-7',  name: 'Рис (варёный)',                calories: 130, protein: 2.7, fat: 0.3, carbs: 28, category: 'grains' },
  { id: 'food-8',  name: 'Гречка (варёная)',             calories: 110, protein: 4,   fat: 1,   carbs: 21, category: 'grains' },
  { id: 'food-9',  name: 'Овсянка на воде',              calories: 88,  protein: 3,   fat: 1.5, carbs: 15, category: 'grains' },
  { id: 'food-10', name: 'Хлеб цельнозерновой',          calories: 247, protein: 9,   fat: 3,   carbs: 45, category: 'grains' },
  { id: 'food-11', name: 'Макароны (варёные)',            calories: 158, protein: 5.5, fat: 0.9, carbs: 31, category: 'grains' },
  // Молочка
  { id: 'food-12', name: 'Молоко 2.5%',                  calories: 52,  protein: 2.8, fat: 2.5, carbs: 4.7, category: 'dairy' },
  { id: 'food-13', name: 'Греческий йогурт 2%',          calories: 73,  protein: 10,  fat: 2,   carbs: 4,   category: 'dairy' },
  { id: 'food-14', name: 'Сыр чеддер',                   calories: 402, protein: 25,  fat: 33,  carbs: 1.3, category: 'dairy' },
  // Овощи
  { id: 'food-15', name: 'Брокколи',                     calories: 34,  protein: 2.8, fat: 0.4, carbs: 7,   category: 'vegetables' },
  { id: 'food-16', name: 'Огурец',                       calories: 15,  protein: 0.7, fat: 0.1, carbs: 3.6, category: 'vegetables' },
  { id: 'food-17', name: 'Помидор',                      calories: 18,  protein: 0.9, fat: 0.2, carbs: 3.9, category: 'vegetables' },
  { id: 'food-18', name: 'Картофель (варёный)',           calories: 86,  protein: 2,   fat: 0.1, carbs: 20,  category: 'vegetables' },
  { id: 'food-19', name: 'Морковь',                      calories: 41,  protein: 0.9, fat: 0.2, carbs: 10,  category: 'vegetables' },
  // Фрукты
  { id: 'food-20', name: 'Яблоко',                       calories: 52,  protein: 0.3, fat: 0.2, carbs: 14,  category: 'fruits' },
  { id: 'food-21', name: 'Банан',                        calories: 89,  protein: 1.1, fat: 0.3, carbs: 23,  category: 'fruits' },
  { id: 'food-22', name: 'Апельсин',                     calories: 47,  protein: 0.9, fat: 0.1, carbs: 12,  category: 'fruits' },
  { id: 'food-23', name: 'Черника',                      calories: 57,  protein: 0.7, fat: 0.3, carbs: 14,  category: 'fruits' },
  // Жиры
  { id: 'food-24', name: 'Авокадо',                      calories: 160, protein: 2,   fat: 15,  carbs: 9,   category: 'fats' },
  { id: 'food-25', name: 'Миндаль',                      calories: 579, protein: 21,  fat: 50,  carbs: 22,  category: 'fats' },
  { id: 'food-26', name: 'Оливковое масло',              calories: 884, protein: 0,   fat: 100, carbs: 0,   category: 'fats' },
  // Напитки
  { id: 'food-27', name: 'Кофе чёрный',                  calories: 2,   protein: 0.3, fat: 0,   carbs: 0,   category: 'drinks' },
  { id: 'food-28', name: 'Апельсиновый сок',             calories: 45,  protein: 0.7, fat: 0.2, carbs: 10,  category: 'drinks' },
  // Сладкое
  { id: 'food-29', name: 'Шоколад тёмный 70%',           calories: 598, protein: 7,   fat: 43,  carbs: 46,  category: 'sweets' },
  { id: 'food-30', name: 'Мёд',                          calories: 304, protein: 0.3, fat: 0,   carbs: 82,  category: 'sweets' },
]

function computedEntry(
  id: string,
  foodId: string,
  date: string,
  mealType: MealEntry['mealType'],
  amount: number
): MealEntry {
  const food = mockFoodDatabase.find((f) => f.id === foodId)!
  const factor = amount / 100
  return {
    id,
    foodId,
    date,
    mealType,
    amount,
    calories: Math.round(food.calories * factor),
    protein:  Math.round(food.protein  * factor * 10) / 10,
    fat:      Math.round(food.fat      * factor * 10) / 10,
    carbs:    Math.round(food.carbs    * factor * 10) / 10,
  }
}

const today    = format(new Date(), 'yyyy-MM-dd')
const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
const twoDaysAgo = format(subDays(new Date(), 2), 'yyyy-MM-dd')

export const mockMealEntries: MealEntry[] = [
  // Вчера
  computedEntry('me-1',  'food-9',  yesterday, 'breakfast', 200),
  computedEntry('me-2',  'food-12', yesterday, 'breakfast', 200),
  computedEntry('me-3',  'food-1',  yesterday, 'lunch',     200),
  computedEntry('me-4',  'food-7',  yesterday, 'lunch',     150),
  computedEntry('me-5',  'food-15', yesterday, 'lunch',     100),
  computedEntry('me-6',  'food-21', yesterday, 'snack',     120),
  computedEntry('me-7',  'food-4',  yesterday, 'dinner',    180),
  computedEntry('me-8',  'food-8',  yesterday, 'dinner',    150),
  // Позавчера
  computedEntry('me-9',  'food-2',  twoDaysAgo, 'breakfast', 150),
  computedEntry('me-10', 'food-10', twoDaysAgo, 'breakfast', 80),
  computedEntry('me-11', 'food-3',  twoDaysAgo, 'lunch',     200),
  computedEntry('me-12', 'food-11', twoDaysAgo, 'lunch',     200),
  computedEntry('me-13', 'food-20', twoDaysAgo, 'snack',     180),
  computedEntry('me-14', 'food-6',  twoDaysAgo, 'snack',     150),
  computedEntry('me-15', 'food-1',  twoDaysAgo, 'dinner',    200),
  computedEntry('me-16', 'food-18', twoDaysAgo, 'dinner',    200),
  // Сегодня
  computedEntry('me-17', 'food-9',  today, 'breakfast', 200),
  computedEntry('me-18', 'food-13', today, 'breakfast', 150),
  computedEntry('me-19', 'food-1',  today, 'lunch',     200),
  computedEntry('me-20', 'food-7',  today, 'lunch',     150),
]

export const mockNutritionGoals: NutritionGoals = {
  calories: 2200,
  protein:  150,
  fat:       70,
  carbs:    250,
}

export function getWeeklyActivity(): { day: string; completed: number; total: number }[] {
  const result = []
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i)
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayHabits = mockHabits.filter((h) => {
      if (h.isArchived) return false
      const dow = date.getDay()
      if (h.frequency === 'daily') return true
      if (Array.isArray(h.frequency)) return h.frequency.includes(dow)
      return false
    })
    const completed = dayHabits.filter((h) =>
      mockHabitLogs.some((l) => l.habitId === h.id && l.date === dateStr && l.completed)
    ).length
    result.push({ day: dayNames[date.getDay()], completed, total: dayHabits.length })
  }
  return result
}
