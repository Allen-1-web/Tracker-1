'use client'

import { create } from 'zustand'
import { format } from 'date-fns'
import type { Habit, HabitLog, Goal, GoalProgress, User, Category } from './types'
import {
  mockUser,
  mockHabits,
  mockHabitLogs,
  mockGoals,
  mockGoalProgress,
  mockCategories,
} from './mock-data'

interface AppStore {
  user: User
  habits: Habit[]
  habitLogs: HabitLog[]
  goals: Goal[]
  goalProgress: GoalProgress[]
  categories: Category[]

  // Habit actions
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void
  updateHabit: (id: string, updates: Partial<Habit>) => void
  archiveHabit: (id: string) => void
  deleteHabit: (id: string) => void
  toggleHabitLog: (habitId: string, date?: string) => void

  // Goal actions
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  addGoalProgress: (progress: Omit<GoalProgress, 'id'>) => void

  // User actions
  updateUser: (updates: Partial<User>) => void

  // Category actions
  addCategory: (cat: Omit<Category, 'id'>) => void
  updateCategory: (id: string, updates: Partial<Category>) => void
  deleteCategory: (id: string) => void
}

export const useStore = create<AppStore>((set) => ({
  user: mockUser,
  habits: mockHabits,
  habitLogs: mockHabitLogs,
  goals: mockGoals,
  goalProgress: mockGoalProgress,
  categories: mockCategories,

  addHabit: (habit) =>
    set((state) => ({
      habits: [
        ...state.habits,
        { ...habit, id: `habit-${Date.now()}`, createdAt: new Date() },
      ],
    })),

  updateHabit: (id, updates) =>
    set((state) => ({
      habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    })),

  archiveHabit: (id) =>
    set((state) => ({
      habits: state.habits.map((h) => (h.id === id ? { ...h, isArchived: true } : h)),
    })),

  deleteHabit: (id) =>
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== id),
    })),

  toggleHabitLog: (habitId, date) => {
    const dateStr = date ?? format(new Date(), 'yyyy-MM-dd')
    set((state) => {
      const existing = state.habitLogs.find(
        (l) => l.habitId === habitId && l.date === dateStr
      )
      if (existing) {
        return {
          habitLogs: state.habitLogs.map((l) =>
            l.habitId === habitId && l.date === dateStr
              ? { ...l, completed: !l.completed }
              : l
          ),
        }
      }
      return {
        habitLogs: [...state.habitLogs, { habitId, date: dateStr, completed: true }],
      }
    })
  },

  addGoal: (goal) =>
    set((state) => ({
      goals: [
        ...state.goals,
        { ...goal, id: `goal-${Date.now()}`, createdAt: new Date() },
      ],
    })),

  updateGoal: (id, updates) =>
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    })),

  deleteGoal: (id) =>
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id),
    })),

  addGoalProgress: (progress) =>
    set((state) => {
      const entry: GoalProgress = { ...progress, id: `gp-${Date.now()}` }
      const updatedGoals = state.goals.map((g) =>
        g.id === progress.goalId ? { ...g, currentValue: progress.value } : g
      )
      return {
        goalProgress: [...state.goalProgress, entry],
        goals: updatedGoals,
      }
    }),

  updateUser: (updates) =>
    set((state) => ({ user: { ...state.user, ...updates } })),

  addCategory: (cat) =>
    set((state) => ({
      categories: [...state.categories, { ...cat, id: `cat-${Date.now()}` }],
    })),

  updateCategory: (id, updates) =>
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),

  deleteCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    })),
}))
