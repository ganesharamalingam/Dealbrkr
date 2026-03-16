import { ReactNode } from 'react'
import { Zap } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-surface-1">
      <header className="bg-white border-b border-surface-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-brand-700 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-ink-0">DealBrkr</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-3 font-mono bg-surface-2 px-2 py-1 rounded">v1.0</span>
              <span className="text-xs text-ink-4 hidden sm:inline">Commercial Estimation Engine</span>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  )
}
