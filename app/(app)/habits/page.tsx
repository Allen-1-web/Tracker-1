'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { HabitCard } from '@/components/habits/habit-card'
import { AddHabitModal } from '@/components/habits/add-habit-modal'
import { EmptyState } from '@/components/shared/empty-state'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStore } from '@/lib/store'
import { mockHabitStats } from '@/lib/mock-data'
import { format } from 'date-fns'

type Filter = 'all' | 'active' | 'archived'

export default function HabitsPage() {
  const { habits, toggleHabitLog, habitLogs } = useStore()
  const [filter, setFilter] = useState<Filter>('active')
  const [search, setSearch] = useState('')

  const today = format(new Date(), 'yyyy-MM-dd')

  const isCompletedToday = (habitId: string) =>
    habitLogs.some((l) => l.habitId === habitId && l.date === today && l.completed)

  const filtered = habits.filter((h) => {
    if (filter === 'active' && h.isArchived) return false
    if (filter === 'archived' && !h.isArchived) return false
    if (search && !h.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <AppLayout title="Привычки">
      <div className="max-w-4xl space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList>
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="active">Активные</TabsTrigger>
              <TabsTrigger value="archived">Архив</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <Input
                placeholder="Поиск привычек..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <AddHabitModal />
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex gap-4 text-sm text-[var(--muted-foreground)]">
          <span>{habits.filter((h) => !h.isArchived).length} активных</span>
          <span>·</span>
          <span>
            {habits.filter((h) => {
              if (h.isArchived) return false
              return isCompletedToday(h.id)
            }).length}{' '}
            выполнено сегодня
          </span>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="✨"
            title={search ? 'Ничего не найдено' : 'Нет привычек'}
            description={search ? 'Попробуйте другой запрос' : 'Добавьте первую привычку, чтобы начать'}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                stats={mockHabitStats.find((s) => s.habitId === habit.id)}
                completedToday={isCompletedToday(habit.id)}
                onToggle={() => toggleHabitLog(habit.id)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
