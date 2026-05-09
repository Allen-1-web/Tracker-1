'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, Clock } from 'lucide-react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { GoalProgressChart } from '@/components/goals/goal-progress-chart'
import { LinkedHabitsList } from '@/components/goals/linked-habits-list'
import { ProgressFeed } from '@/components/goals/progress-feed'
import { AddProgressModal } from '@/components/goals/add-progress-modal'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { CategoryBadge } from '@/components/shared/category-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useStore } from '@/lib/store'
import { mockHabitStats } from '@/lib/mock-data'
import { getDaysRemaining, formatDate } from '@/lib/utils'

export default function GoalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { goals, habits, goalProgress, deleteGoal } = useStore()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const goal = goals.find((g) => g.id === params.id)
  if (!goal) {
    return (
      <AppLayout title="Цель не найдена">
        <Link href="/goals" className="text-[var(--primary)] hover:underline">← Назад</Link>
      </AppLayout>
    )
  }

  const pct = Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100)
  const daysLeft = getDaysRemaining(goal.deadline)
  const isOverdue = daysLeft < 0
  const isCompleted = pct >= 100

  const linkedHabits = habits.filter((h) => goal.linkedHabitIds.includes(h.id))
  const goalProgressEntries = goalProgress.filter((p) => p.goalId === goal.id)

  return (
    <AppLayout title={goal.name}>
      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/goals">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{goal.name}</h2>
            <div className="flex items-center gap-3 mt-2">
              <CategoryBadge name={goal.category} />
              <span className={`flex items-center gap-1 text-sm ${isOverdue ? 'text-red-500' : isCompleted ? 'text-green-600' : 'text-[var(--muted-foreground)]'}`}>
                <Clock className="h-3.5 w-3.5" />
                {isCompleted ? 'Выполнено!' : isOverdue ? `Просрочена на ${Math.abs(daysLeft)} дн.` : `${daysLeft} дней осталось`}
              </span>
              <span className="text-sm text-[var(--muted-foreground)]">Дедлайн: {formatDate(goal.deadline)}</span>
            </div>
            {goal.description && (
              <p className="text-sm text-[var(--muted-foreground)] mt-2">{goal.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <AddProgressModal goalId={goal.id} unit={goal.unit} currentValue={goal.currentValue} />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDeleteOpen(true)}
              className="text-[var(--destructive)]"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Big progress */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-4xl font-bold">
                  {goal.currentValue}
                  <span className="text-lg text-[var(--muted-foreground)] ml-1">{goal.unit}</span>
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  из {goal.targetValue} {goal.unit}
                </p>
              </div>
              <p className={`text-3xl font-bold ${isCompleted ? 'text-green-600' : 'text-[var(--primary)]'}`}>
                {pct}%
              </p>
            </div>
            <Progress
              value={pct}
              className="h-4"
              indicatorColor={isCompleted ? '#22c55e' : isOverdue ? '#ef4444' : undefined}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Chart */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base">Прогресс по времени</CardTitle>
            </CardHeader>
            <CardContent>
              <GoalProgressChart
                progressEntries={goalProgressEntries}
                targetValue={goal.targetValue}
                unit={goal.unit}
              />
            </CardContent>
          </Card>

          {/* Linked habits */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Связанные привычки</CardTitle>
            </CardHeader>
            <CardContent>
              <LinkedHabitsList habits={linkedHabits} stats={mockHabitStats} />
            </CardContent>
          </Card>
        </div>

        {/* Progress feed */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Лента прогресса</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <ProgressFeed entries={goalProgressEntries} unit={goal.unit} />
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Удалить цель?"
        description={`Цель "${goal.name}" будет удалена безвозвратно.`}
        confirmLabel="Удалить"
        destructive
        onConfirm={() => {
          deleteGoal(goal.id)
          router.push('/goals')
        }}
      />
    </AppLayout>
  )
}
