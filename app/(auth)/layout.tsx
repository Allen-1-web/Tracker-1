import { Zap } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-[var(--primary)] flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span className="text-white font-bold text-xl">HabitFlow</span>
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Формируй привычки.<br />Достигай целей.
          </h2>
          <p className="text-white/70 text-lg">
            Отслеживай прогресс ежедневно, анализируй статистику и становись лучше с каждым днём.
          </p>
          <div className="flex gap-6 pt-4">
            {[
              { num: '500+', label: 'Привычек создано' },
              { num: '94%', label: 'Пользователей достигают целей' },
              { num: '🔥21', label: 'Средний streak' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-white">{stat.num}</p>
                <p className="text-white/60 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/40 text-sm">© 2026 HabitFlow</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg">HabitFlow</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
