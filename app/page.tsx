import Link from 'next/link'
import { Zap, CheckSquare, BarChart3, Bell, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: CheckSquare,
    title: 'Ежедневный учёт',
    description: 'Отмечай выполненные привычки одним нажатием. Не упусти ни одного дня.',
    color: '#6366f1',
  },
  {
    icon: BarChart3,
    title: 'Аналитика и графики',
    description: 'Тепловые карты, streak-счётчики и детальная статистика за любой период.',
    color: '#22c55e',
  },
  {
    icon: Target,
    title: 'Трекер целей',
    description: 'Привязывай цели к привычкам и следи за прогрессом к дедлайну.',
    color: '#f59e0b',
  },
  {
    icon: Bell,
    title: 'Напоминания',
    description: 'Получай напоминания через Telegram-бота в удобное для тебя время.',
    color: '#ec4899',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Nav */}
      <nav className="border-b border-[var(--border)] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)]">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg">HabitFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Войти</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Начать бесплатно</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-1.5 text-sm text-[var(--muted-foreground)] mb-6">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Сейчас в разработке — бесплатно навсегда
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-[var(--foreground)] leading-tight mb-6">
          Формируй привычки.<br />
          <span className="text-[var(--primary)]">Достигай целей.</span>
        </h1>
        <p className="text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto mb-10">
          Простой и красивый трекер привычек с аналитикой, графиками прогресса и напоминаниями в Telegram.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/register">Создать аккаунт</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Уже есть аккаунт — войти →</Link>
          </Button>
        </div>

        {/* Preview mockup */}
        <div className="mt-16 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl text-left max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--border)]">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-[var(--muted-foreground)] mx-auto">habitflow.app/dashboard</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Сегодня, пятница</p>
              <span className="text-xs text-[var(--muted-foreground)]">Выполнено 3/6</span>
            </div>
            {[
              { name: 'Утренняя зарядка', emoji: '🏋️', done: true },
              { name: 'Читать 30 минут', emoji: '📖', done: true },
              { name: 'Пить 2л воды', emoji: '💧', done: true },
              { name: 'Медитация', emoji: '🧘', done: false },
            ].map((h) => (
              <div key={h.name} className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3">
                <span>{h.emoji}</span>
                <span className={`text-sm flex-1 ${h.done ? 'line-through text-[var(--muted-foreground)]' : ''}`}>{h.name}</span>
                <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center ${h.done ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-[var(--border)]'}`}>
                  {h.done && <span className="text-white text-xs">✓</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Всё что нужно для роста</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 flex gap-4"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: f.color + '20' }}
                >
                  <Icon className="h-6 w-6" style={{ color: f.color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--foreground)] mb-1">{f.title}</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">{f.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <div className="rounded-2xl bg-[var(--primary)] p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Начни прямо сейчас</h2>
          <p className="text-white/70 mb-8">Регистрация занимает 30 секунд. Никакой карты.</p>
          <Button size="lg" className="bg-white text-[var(--primary)] hover:bg-white/90" asChild>
            <Link href="/register">Создать аккаунт бесплатно</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--muted-foreground)]">
        © 2026 HabitFlow. Сделано с ❤️
      </footer>
    </div>
  )
}
