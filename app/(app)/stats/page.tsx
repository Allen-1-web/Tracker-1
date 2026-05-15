'use client'

import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { subWeeks, format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { ru } from 'date-fns/locale'
import { AppLayout } from '@/components/layout/app-layout'
import { EmptyState } from '@/components/shared/empty-state'
import { HabitHeatmap } from '@/components/habits/habit-heatmap'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StreakBadge } from '@/components/shared/streak-badge'
import { useStore } from '@/lib/store'
import { computeAllHabitStats, getHabitLogsForRange } from '@/lib/habit-analytics'

type Period = '7' | '30' | '90' | '365'

const CATEGORY_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6', '#a855f7']

export default function StatsPage() {
  const { habits, habitLogs } = useStore()
  const [period, setPeriod] = useState<Period>('30')

  const activeHabits = habits.filter((h) => !h.isArchived)

  const habitCompletionStats = computeAllHabitStats(activeHabits, habitLogs).filter((s) =>
    activeHabits.some((h) => h.id === s.habitId)
  )
  const avgCompletion =
    habitCompletionStats.length === 0
      ? 0
      : Math.round(
          habitCompletionStats.reduce((acc, h) => acc + h.completionRate30, 0) /
            habitCompletionStats.length
        )

  // Global streak (days with at least one habit done)
  const today = new Date()
  let globalStreak = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = format(d, 'yyyy-MM-dd')
    const anyDone = habitLogs.some((l) => l.date === dateStr && l.completed)
    if (anyDone) globalStreak++
    else break
  }

  // Weekly comparison chart
  const weeksCount = period === '7' ? 1 : period === '30' ? 4 : period === '90' ? 13 : 52
  const weeklyData = Array.from({ length: Math.min(weeksCount, 12) }, (_, i) => {
    const idx = weeksCount - 1 - i
    const ws = startOfWeek(subWeeks(today, idx), { weekStartsOn: 1 })
    const we = endOfWeek(ws, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: ws, end: we <= today ? we : today })
    const total = days.reduce((sum, d) => {
      const dow = d.getDay()
      const dayHabits = activeHabits.filter((h) => {
        if (h.frequency === 'daily') return true
        if (Array.isArray(h.frequency)) return h.frequency.includes(dow)
        return false
      })
      return sum + dayHabits.length
    }, 0)
    const completed = days.reduce((sum, d) => {
      const dateStr = format(d, 'yyyy-MM-dd')
      return sum + habitLogs.filter((l) => l.date === dateStr && l.completed).length
    }, 0)
    return {
      week: format(ws, 'd MMM', { locale: ru }),
      completed,
      total,
      pct: total === 0 ? 0 : Math.round((completed / total) * 100),
    }
  })

  // Category pie
  const categoryMap = new Map<string, number>()
  activeHabits.forEach((h) => {
    categoryMap.set(h.category, (categoryMap.get(h.category) ?? 0) + 1)
  })
  const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }))

  // Heatmap data (all habits merged)
  const allLogs = getHabitLogsForRange(activeHabits[0]?.id ?? '', 365, habitLogs)

  return (
    <AppLayout title="Статистика">
      <div className="max-w-4xl space-y-6 min-w-0">
        {/* Period selector */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h2 className="text-lg font-semibold shrink-0">Аналитика</h2>
          <div className="w-full min-w-0 overflow-x-auto pb-0.5 sm:w-auto sm:max-w-[min(100%,28rem)]">
            <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
              <TabsList className="w-max max-w-full">
              <TabsTrigger value="7">Неделя</TabsTrigger>
              <TabsTrigger value="30">Месяц</TabsTrigger>
              <TabsTrigger value="90">3 мес.</TabsTrigger>
              <TabsTrigger value="365">Год</TabsTrigger>
            </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-3xl font-bold">{globalStreak}</p>
              <p className="text-sm text-[var(--muted-foreground)]">Дней активности подряд</p>
              <StreakBadge streak={globalStreak} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-3xl font-bold">{activeHabits.length}</p>
              <p className="text-sm text-[var(--muted-foreground)]">Активных привычек</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-3xl font-bold">{avgCompletion}%</p>
              <p className="text-sm text-[var(--muted-foreground)]">Средний % выполнения</p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Выполнение по неделям</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            {activeHabits.length === 0 ? (
              <EmptyState
                icon="📅"
                title="Нет привычек для графика"
                description="Добавьте хотя бы одну активную привычку — тогда появится динамика выполнения по неделям."
                compact
                className="py-8"
                action={{ label: 'К привычкам', href: '/habits' }}
              />
            ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradPct" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Выполнение']}
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="pct" stroke="#6366f1" strokeWidth={2} fill="url(#gradPct)" />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Category pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Привычки по категориям</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            {categoryData.length === 0 ? (
              <EmptyState
                icon="🥧"
                title="Нет категорий"
                description="У активных привычек пока не задано распределение по категориям для диаграммы."
                compact
                className="py-8"
                action={{ label: 'К привычкам', href: '/habits' }}
              />
            ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}
                  labelLine={false}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={index} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Year heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Активность за год</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0 overflow-x-auto">
            {activeHabits.length === 0 ? (
              <EmptyState
                icon="🗓️"
                title="Нет данных для тепловой карты"
                description="Создайте привычку и отмечайте дни — годовая активность появится здесь."
                compact
                className="py-8"
                action={{ label: 'К привычкам', href: '/habits' }}
              />
            ) : (
            <HabitHeatmap logs={allLogs} />
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
