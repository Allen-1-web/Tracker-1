'use client'

import { Suspense, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { GoalCard } from '@/components/goals/goal-card'
import { AddGoalModal } from '@/components/goals/add-goal-modal'
import { EmptyState } from '@/components/shared/empty-state'
import {
  ListGoalsLoadingGrid,
  ListLoadErrorState,
  ListSummaryLineSkeleton,
} from '@/components/shared/list-load-state'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStore } from '@/lib/store'
import { useSimulatedListLoad } from '@/lib/use-simulated-list-load'
import { getDaysRemaining } from '@/lib/utils'

type Filter = 'all' | 'active' | 'completed' | 'overdue'

function GoalsPageInner() {
  const { goals, habits } = useStore()
  const [filter, setFilter] = useState<Filter>('all')
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const urlFailDemo = searchParams.get('listError') === '1'
  const [dismissedListErrorDemo, setDismissedListErrorDemo] = useState(false)
  const shouldFailLoad = urlFailDemo && !dismissedListErrorDemo
  const { phase, retryLoad } = useSimulatedListLoad(shouldFailLoad)

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

  const handleListRetry = () => {
    setDismissedListErrorDemo(true)
    retryLoad()
    if (searchParams.get('listError')) router.replace(pathname)
  }

  return (
    <AppLayout title="Цели">
      <div className="max-w-4xl space-y-4 min-w-0">
        {/* Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full min-w-0 overflow-x-auto pb-0.5">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
              <TabsList className="w-max max-w-full">
                <TabsTrigger value="all">Все</TabsTrigger>
                <TabsTrigger value="active">В процессе</TabsTrigger>
                <TabsTrigger value="completed">Выполнены</TabsTrigger>
                <TabsTrigger value="overdue">Просрочены</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="shrink-0 self-start sm:self-auto">
            <AddGoalModal />
          </div>
        </div>

        {phase === 'loading' && (
          <>
            <ListSummaryLineSkeleton />
            <ListGoalsLoadingGrid />
          </>
        )}

        {phase === 'error' && <ListLoadErrorState onRetry={handleListRetry} />}

        {phase === 'ready' && (
          <>
            {/* Summary */}
            <div className="flex gap-3 text-sm text-[var(--muted-foreground)]">
              <span>{goals.length} целей всего</span>
              <span>·</span>
              <span>{goals.filter((g) => g.currentValue / g.targetValue >= 1).length} выполнено</span>
            </div>

            {/* Goals grid */}
            {filtered.length === 0 ? (
              goals.length === 0 ? (
                <EmptyState
                  icon="🎯"
                  title="Целей нет"
                  description="Добавьте первую цель и начните отслеживать прогресс"
                />
              ) : (
                <EmptyState
                  icon="🔍"
                  title="Нет целей по фильтру"
                  description="Попробуйте другой фильтр или сбросьте отбор — подходящих целей не найдено."
                />
              )
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {filtered.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    linkedHabitIcons={getLinkedHabitIcons(goal.linkedHabitIds)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}

function GoalsPageFallback() {
  return (
    <AppLayout title="Цели">
      <div className="max-w-4xl space-y-4 min-w-0">
        <div className="h-10 w-full max-w-md animate-pulse rounded-lg bg-[var(--muted)]" />
        <ListSummaryLineSkeleton />
        <ListGoalsLoadingGrid />
      </div>
    </AppLayout>
  )
}

export default function GoalsPage() {
  return (
    <Suspense fallback={<GoalsPageFallback />}>
      <GoalsPageInner />
    </Suspense>
  )
}
