'use client'

import { useStore } from '@/lib/store'
import { Checkbox } from '@/components/ui/checkbox'
import { format } from 'date-fns'
import type { Habit } from '@/lib/types'

interface HabitCheckItemProps {
  habit: Habit
  completed: boolean
  onToggle: () => void
}

function HabitCheckItem({ habit, completed, onToggle }: HabitCheckItemProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-4 transition-colors cursor-pointer ${
        completed
          ? 'border-[var(--primary)]/30 bg-[var(--primary)]/5'
          : 'border-[var(--border)] hover:bg-[var(--accent)]'
      }`}
      onClick={onToggle}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg"
        style={{ backgroundColor: habit.color + '20' }}
      >
        {habit.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            completed ? 'line-through text-[var(--muted-foreground)]' : ''
          }`}
        >
          {habit.name}
        </p>
        <p className="text-xs text-[var(--muted-foreground)]">{habit.category}</p>
      </div>
      <Checkbox
        checked={completed}
        onCheckedChange={onToggle}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

export function TodayHabitList() {
  const { habits, habitLogs, toggleHabitLog } = useStore()
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayDow = new Date().getDay()

  const todayHabits = habits.filter((h) => {
    if (h.isArchived) return false
    if (h.frequency === 'daily') return true
    if (Array.isArray(h.frequency)) return h.frequency.includes(todayDow)
    return false
  })

  const isCompleted = (habitId: string) =>
    habitLogs.some((l) => l.habitId === habitId && l.date === today && l.completed)

  const sortedHabits = [...todayHabits].sort((a, b) => {
    const aD = isCompleted(a.id) ? 1 : 0
    const bD = isCompleted(b.id) ? 1 : 0
    return aD - bD
  })

  if (sortedHabits.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--muted-foreground)]">
        <p className="text-lg">🎉</p>
        <p className="text-sm mt-1">На сегодня привычек нет</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sortedHabits.map((habit) => (
        <HabitCheckItem
          key={habit.id}
          habit={habit}
          completed={isCompleted(habit.id)}
          onToggle={() => toggleHabitLog(habit.id)}
        />
      ))}
    </div>
  )
}
