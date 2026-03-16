import { Layout } from './components/Layout'
import { DealInputForm } from './components/DealInput/DealInputForm'
import { ResultsDashboard } from './components/Results/ResultsDashboard'
import { useDealEngine } from './hooks/useDealEngine'
import { BarChart3 } from 'lucide-react'

export default function App() {
  const { input, output, error, estimate, reset, updateInput } = useDealEngine()

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 items-start">
        {/* Left panel — always visible */}
        <div className="lg:sticky lg:top-[calc(3.5rem+1.5rem)] lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto lg:pb-4">
          <DealInputForm
            input={input}
            onUpdate={updateInput}
            onEstimate={estimate}
            onReset={reset}
            error={error}
          />
        </div>

        {/* Right panel — results or placeholder */}
        <div className="min-h-[400px]">
          {output ? (
            <ResultsDashboard output={output} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] border-2 border-dashed border-surface-4 rounded-2xl text-center p-10 animate-fade-in">
              <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-4">
                <BarChart3 className="w-7 h-7 text-brand-600" />
              </div>
              <h3 className="text-lg font-semibold text-ink-0 mb-2">Ready to Estimate</h3>
              <p className="text-sm text-ink-3 max-w-sm">
                Configure your deal on the left — add work categories, set volumes and rates — then click
                <strong className="text-ink-1"> Generate Estimate</strong> to see your structured commercial model.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-ink-3 max-w-xs">
                {[
                  '✓ Pre/Post-AI effort hours',
                  '✓ FTE equivalents',
                  '✓ Bounded AI compression ranges',
                  '✓ 3-year cost glidepath',
                  '✓ Margin simulation',
                  '✓ Sensitivity drivers',
                  '✓ Export to Excel / JSON',
                  '✓ Full assumption audit trail',
                ].map(f => (
                  <div key={f} className="text-left">{f}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
