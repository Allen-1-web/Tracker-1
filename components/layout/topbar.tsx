'use client'

import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TopbarProps {
  title: string
}

export function Topbar({ title }: TopbarProps) {
  const today = format(new Date(), 'EEEE, d MMMM', { locale: ru })

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur px-6 py-4">
      <div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">{title}</h1>
        <p className="text-xs text-[var(--muted-foreground)] capitalize">{today}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[var(--primary)]" />
        </Button>
      </div>
    </header>
  )
}
