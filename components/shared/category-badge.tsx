import { cn } from '@/lib/utils'

interface CategoryBadgeProps {
  name: string
  color?: string
  icon?: string
  className?: string
}

export function CategoryBadge({ name, color = '#6366f1', icon, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', className)}
      style={{ backgroundColor: color + '20', color }}
    >
      {icon && <span>{icon}</span>}
      {name}
    </span>
  )
}
