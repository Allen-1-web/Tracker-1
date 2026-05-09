'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { GoalCard } from '@/components/goals/goal-card'
import { AddGoalModal } from '@/components/goals/add-goal-modal'
import { EmptyState } from '@/components/shared/empty-state'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStore } from '@/lib/store'
import { getDaysRemaining } from '@/lib/utils'

type Filter = 'all' | 'active' | 'completed' | 'overdue'

export default function GoalsPage() {
  const { goals, habits } = useStore()
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = goals.filter((g) => {
    const pct = (g.currentValue / g.targetValue) * 100
    const daysLeft = getDaysRemaining(g.deadline)
    if (filter === 'completed') return pct >= 100
    if (filter === 'overdue') return daysLeft < 0 && pct < 100
    if (filter === 'active') return pct < 100 && daysLeft >= 0
    return true
  })

  const getLinkedHabitIcons = (linkedIds: string[]) =>
    linkedIds.map((id) => habits.find((h) => h.id === id)?.icon ?? '').filter(Boolean)

  return (
    <AppLayout title="Цели">
      <div className="max-w-4xl space-y-6">
        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList>
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="active">В процессе</TabsTrigger>
              <TabsTrigger value="completed">Выполнены</TabsTrigger>
              <TabsTrigger value="overdue">Просрочены</TabsTrigger>
            </TabsList>
          </Tabs>
          <AddGoalModal />
        </div>

        {/* Summary */}
        <div className="flex gap-4 text-sm text-[var(--muted-foreground)]">
          <span>{goals.length} целей всего</span>
          <span>·</span>
          <span>{goals.filter((g) => (g.currentValue / g.targetValue) >= 1).length} выполнено</span>
        </div>

        {/* Goals grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="🎯"
            title="Целей нет"
            description="Добавьте первую цель и начните отслеживать прогресс"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                linkedHabitIcons={getLinkedHabitIcons(goal.linkedHabitIds)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
