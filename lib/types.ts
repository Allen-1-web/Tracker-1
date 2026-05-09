export type HabitFrequency = 'daily' | number[] // number[] = дни недели 0-6

export interface Habit {
  id: string
  name: string
  icon: string
  color: string
  category: string
  frequency: HabitFrequency
  createdAt: Date
  isArchived: boolean
}

export interface HabitLog {
  habitId: string
  date: string // 'YYYY-MM-DD'
  completed: boolean
}

export type GoalType = 'numeric' | 'binary'
export type GoalStatus = 'active' | 'completed' | 'overdue'

export interface Goal {
  id: string
  name: string
  description?: string
  type: GoalType
  targetValue: number
  currentValue: number
  unit?: string
  deadline: Date
  category: string
  linkedHabitIds: string[]
  createdAt: Date
}

export interface GoalProgress {
  id: string
  goalId: string
  date: Date
  value: number
  note?: string
}

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  telegramConnected: boolean
  telegramUsername?: string
  theme: 'light' | 'dark' | 'system'
  reminderTime?: string // 'HH:mm'
  remindersEnabled: boolean
}

export interface Category {
  id: string
  name: string
  color: string
  icon: string
}

export interface HabitStats {
  habitId: string
  currentStreak: number
  bestStreak: number
  completionRate30: number
  completionRate90: number
  totalCompleted: number
}
