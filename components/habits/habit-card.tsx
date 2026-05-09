'use client'

import Link from 'next/link'
import { CheckCircle2, Circle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { StreakBadge } from '@/components/shared/streak-badge'
import { CategoryBadge } from '@/components/shared/category-badge'
import type { Habit, HabitStats } from '@/lib/types'

interface HabitCardProps {
  habit: Habit
  stats?: HabitStats
  completedToday: boolean
  onToggle?: () => void
}

export function HabitCard({ habit, stats, completedToday, onToggle }: HabitCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow group">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
            style={{ backgroundColor: habit.color + '20' }}
          >
            {habit.icon}
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/habits/${habit.id}`} className="hover:underline">
              <p className="font-semibold text-[var(--foreground)] truncate">{habit.name}</p>
            </Link>
            <CategoryBadge name={habit.category} className="mt-1" />
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              onToggle?.()
            }}
            className="shrink-0 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
          >
            {completedToday ? (
              <CheckCircle2 className="h-6 w-6 text-[var(--primary)]" />
            ) : (
              <Circle className="h-6 w-6" />
            )}
          </button>
        </div>

        {stats && (
          <>
            <Progress value={stats.completionRate30} className="mb-2" indicatorColor={habit.color} />
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--muted-foreground)]">
                {stats.completionRate30}% за 30 дней
              </span>
              {stats.currentStreak > 0 && (
                <StreakBadge streak={stats.currentStreak} size="sm" />
              )}
            </div>
          </>
        )}

        {completedToday && (
          <p className="text-xs text-green-600 mt-2 font-medium">✓ Выполнено сегодня</p>
        )}
      </CardContent>
    </Card>
  )
}
