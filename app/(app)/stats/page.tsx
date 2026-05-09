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
  Legend,
} from 'recharts'
import { subWeeks, format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { ru } from 'date-fns/locale'
import { AppLayout } from '@/components/layout/app-layout'
import { HabitHeatmap } from '@/components/habits/habit-heatmap'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StreakBadge } from '@/components/shared/streak-badge'
import { useStore } from '@/lib/store'
import { mockHabitStats, getHabitLogsForRange } from '@/lib/mock-data'

type Period = '7' | '30' | '90' | '365'

const CATEGORY_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6', '#a855f7']

export default function StatsPage() {
  const { habits, habitLogs } = useStore()
  const [period, setPeriod] = useState<Period>('30')

  const activeHabits = habits.filter((h) => !h.isArchived)

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

  // Top / weak habits
  const statsWithHabits = mockHabitStats
    .map((s) => ({ ...s, habit: activeHabits.find((h) => h.id === s.habitId) }))
    .filter((s) => s.habit)
    .sort((a, b) => b.completionRate30 - a.completionRate30)

  const topHabits = statsWithHabits.slice(0, 3)
  const weakHabits = [...statsWithHabits].reverse().slice(0, 3)

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
  const allLogs = getHabitLogsForRange(activeHabits[0]?.id ?? '', 365)

  return (
    <AppLayout title="Статистика">
      <div className="max-w-4xl space-y-6">
        {/* Period selector */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Аналитика</h2>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <TabsList>
              <TabsTrigger value="7">Неделя</TabsTrigger>
              <TabsTrigger value="30">Месяц</TabsTrigger>
              <TabsTrigger value="90">3 мес.</TabsTrigger>
              <TabsTrigger value="365">Год</TabsTrigger>
            </TabsList>
          </Tabs>
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
              <p className="text-3xl font-bold">
                {statsWithHabits.length > 0
                  ? Math.round(statsWithHabits.reduce((s, h) => s + h.completionRate30, 0) / statsWithHabits.length)
                  : 0}%
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">Средний % выполнения</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top habits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Лучшие привычки 🏆</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topHabits.map((s, i) => (
                <div key={s.habitId} className="flex items-center gap-3">
                  <span className="text-[var(--muted-foreground)] text-sm w-5">#{i + 1}</span>
                  <span className="text-lg">{s.habit?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.habit?.name}</p>
                    <div className="h-1.5 bg-[var(--muted)] rounded-full mt-1">
                      <div
                        className="h-1.5 rounded-full bg-green-500"
                        style={{ width: `${s.completionRate30}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-green-600">{s.completionRate30}%</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Weak habits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Требуют внимания ⚠️</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {weakHabits.map((s) => (
                <div key={s.habitId} className="flex items-center gap-3">
                  <span className="text-lg">{s.habit?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.habit?.name}</p>
                    <div className="h-1.5 bg-[var(--muted)] rounded-full mt-1">
                      <div
                        className="h-1.5 rounded-full bg-orange-400"
                        style={{ width: `${s.completionRate30}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-orange-500">{s.completionRate30}%</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Weekly comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Выполнение по неделям</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Category pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Привычки по категориям</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Year heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Активность за год</CardTitle>
          </CardHeader>
          <CardContent>
            <HabitHeatmap logs={allLogs} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
