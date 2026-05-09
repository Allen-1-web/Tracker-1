import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

interface AppLayoutProps {
  children: React.ReactNode
  title: string
}

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <Topbar title={title} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
