import type { Metadata } from 'next'
import './globals.css'
import { AppProvider } from '@/components/providers/app-provider'
import { ErrorBoundary } from '@/components/error-boundary'

export const metadata: Metadata = {
  title: 'HabitFlow — Трекер привычек',
  description: 'Формируй привычки, достигай целей. Ежедневный трекер с аналитикой и напоминаниями.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-screen overflow-x-hidden antialiased">
        <ErrorBoundary>
          <AppProvider>{children}</AppProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
