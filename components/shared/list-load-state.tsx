import { GoalCardSkeleton, HabitCardSkeleton } from '@/components/shared/loading-skeleton'
import { EmptyState } from '@/components/shared/empty-state'

export function ListGoalsLoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <GoalCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ListHabitsLoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <HabitCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ListSummaryLineSkeleton() {
  return (
    <div className="flex gap-3">
      <div className="h-4 w-28 animate-pulse rounded bg-[var(--muted)]" />
      <span className="text-[var(--muted-foreground)]">·</span>
      <div className="h-4 w-32 animate-pulse rounded bg-[var(--muted)]" />
    </div>
  )
}

interface ListLoadErrorStateProps {
  onRetry: () => void
}

export function ListLoadErrorState({ onRetry }: ListLoadErrorStateProps) {
  return (
    <EmptyState
      icon="⚠️"
      title="Не удалось загрузить список"
      description="Попробуйте ещё раз. Для демо ошибки откройте страницу с параметром listError=1 в адресе."
      action={{ label: 'Повторить', onClick: onRetry }}
    />
  )
}
