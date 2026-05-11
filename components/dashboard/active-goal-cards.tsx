import Link from 'next/link'
import { Target, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { EmptyState } from '@/components/shared/empty-state'
import { getDaysRemaining } from '@/lib/utils'
import type { Goal } from '@/lib/types'

interface GoalMiniCardProps {
  goal: Goal
}

function GoalMiniCard({ goal }: GoalMiniCardProps) {
  const pct = Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100)
  const daysLeft = getDaysRemaining(goal.deadline)

  return (
    <Link href={`/goals/${goal.id}`}>
      <Card className="min-w-[200px] cursor-pointer border-0 bg-transparent shadow-none hover:bg-[var(--muted)]/35 dark:hover:bg-[var(--muted)]/45">
        <CardContent className="p-3.5">
          <div className="flex items-start gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]/10">
              <Target className="h-4 w-4 text-[var(--primary)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{goal.name}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{goal.category}</p>
            </div>
          </div>
          <Progress value={pct} className="mb-2" />
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <span>
              {goal.currentValue}/{goal.targetValue} {goal.unit}
            </span>
            <span className={`flex items-center gap-1 ${daysLeft < 30 ? 'text-orange-500' : ''}`}>
              <Clock className="h-3 w-3" />
              {daysLeft > 0 ? `${daysLeft} дн.` : 'Просрочена'}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

interface ActiveGoalCardsProps {
  goals: Goal[]
}

export function ActiveGoalCards({ goals }: ActiveGoalCardsProps) {
  const activeGoals = goals.filter((g) => g.currentValue < g.targetValue)

  if (activeGoals.length === 0) {
    return (
      <EmptyState
        icon="🎯"
        title="Нет активных целей"
        description="Добавьте цель или откройте список всех целей — выполненные здесь не показываются."
        compact
        action={{ label: 'Перейти к целям', href: '/goals' }}
      />
    )
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
      {activeGoals.map((goal) => (
        <GoalMiniCard key={goal.id} goal={goal} />
      ))}
    </div>
  )
}
