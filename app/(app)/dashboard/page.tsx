'use client'

import Link from 'next/link'
import { Plus, UtensilsCrossed } from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { DashboardGreeting } from '@/components/dashboard/dashboard-greeting'
import { TodayProgress } from '@/components/dashboard/today-progress'
import { TodayHabitList } from '@/components/dashboard/today-habit-list'
import { WeeklyActivityStrip } from '@/components/dashboard/weekly-activity-strip'
import { ActiveGoalCards } from '@/components/dashboard/active-goal-cards'
import { MotivationBlock } from '@/components/dashboard/motivation-block'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import { motivationalQuotes, mockHabitStats } from '@/lib/mock-data'
import { format } from 'date-fns'

export default function DashboardPage() {
  const { user, habits, habitLogs, goals, mealEntries, nutritionGoals } = useStore()

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayDow = new Date().getDay()
  const todayHabits = habits.filter((h) => {
    if (h.isArchived) return false
    if (h.frequency === 'daily') return true
    if (Array.isArray(h.frequency)) return h.frequency.includes(todayDow)
    return false
  })
  const completedToday = todayHabits.filter((h) =>
    habitLogs.some((l) => l.habitId === h.id && l.date === today && l.completed)
  ).length

  const maxStreak = Math.max(...mockHabitStats.map((s) => s.currentStreak), 0)
  const avgRate = Math.round(
    mockHabitStats.reduce((sum, s) => sum + s.completionRate30, 0) / mockHabitStats.length
  )

  const quote = motivationalQuotes[new Date().getDay() % motivationalQuotes.length]

  const todayCalories = mealEntries
    .filter((e) => e.date === today)
    .reduce((sum, e) => sum + e.calories, 0)

  return (
    <AppLayout title="Дашборд">
      <div className="max-w-4xl space-y-4 min-w-0">
        {/* Greeting */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <DashboardGreeting name={user.name} quote={quote} />
          <Button asChild className="w-full shrink-0 sm:w-auto">
            <Link href="/habits">
              <Plus className="h-4 w-4 mr-1" /> Привычка
            </Link>
          </Button>
        </div>

        {/* Мотивация */}
        <MotivationBlock quote={quote} />

        {/* Stats */}
        <TodayProgress
          completed={completedToday}
          total={todayHabits.length}
          streak={maxStreak}
          completionRate={avgRate}
        />

        <Link href="/nutrition" className="block">
          <Card className="cursor-pointer hover:bg-[var(--muted)]/30 dark:hover:bg-[var(--muted)]/40">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3 sm:items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                  <UtensilsCrossed className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--foreground)]">Питание и КБЖУ</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Сегодня: {todayCalories} / {nutritionGoals.calories} ккал · дневник и рекомендации
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-[var(--primary)] sm:shrink-0">Открыть →</span>
            </CardContent>
          </Card>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Today habits */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Сегодня</CardTitle>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {completedToday}/{todayHabits.length} выполнено
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <TodayHabitList />
            </CardContent>
          </Card>

          {/* Weekly activity */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Активность за 7 дней</CardTitle>
            </CardHeader>
            <CardContent className="min-w-0 overflow-x-auto">
              <div className="min-w-[280px]">
                <WeeklyActivityStrip />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goals */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Активные цели</CardTitle>
              <Link href="/goals" className="text-xs text-[var(--primary)] hover:underline">
                Все цели →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="min-w-0">
            <ActiveGoalCards goals={goals} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
