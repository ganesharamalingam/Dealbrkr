import { SensitivityDriver } from '../../types/deal'
import { TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react'

interface Props {
  drivers: SensitivityDriver[]
}

const magnitudeConfig = {
  high: { bar: 'bg-red-400', bg: 'bg-red-50 border-red-200', text: 'text-red-600' },
  medium: { bar: 'bg-amber-400', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-600' },
  low: { bar: 'bg-emerald-400', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-600' },
}

const directionIcon = (dir: string) => {
  if (dir === 'cost_increase') return <TrendingUp className="w-4 h-4 text-red-500" />
  if (dir === 'cost_decrease') return <TrendingDown className="w-4 h-4 text-emerald-500" />
  return <ArrowLeftRight className="w-4 h-4 text-brand-500" />
}

export function SensitivityPanel({ drivers }: Props) {
  const sorted = [...drivers].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.impact_magnitude] - order[b.impact_magnitude]
  })

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-3 bg-surface-1 rounded-lg px-3 py-2.5">
        Top cost drivers ranked by impact. These are the levers that materially shift your cost or margin model.
        Review before presenting to stakeholders.
      </p>

      <div className="space-y-3">
        {sorted.map((driver, i) => {
          const cfg = magnitudeConfig[driver.impact_magnitude]
          return (
            <div
              key={i}
              className={`border rounded-xl p-4 ${cfg.bg} transition-all`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{directionIcon(driver.direction)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-sm text-ink-0">{driver.driver}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/60 ${cfg.text}`}>
                      {driver.impact_magnitude} impact
                    </span>
                    <span className="text-xs text-ink-3 font-mono">
                      Current: {String(driver.current_value)}
                    </span>
                  </div>
                  <p className="text-xs text-ink-2 leading-relaxed">{driver.impact_description}</p>
                </div>
              </div>

              {/* Impact bar */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[10px] text-ink-4 w-12">Impact</span>
                <div className="flex-1 h-1.5 bg-white/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cfg.bar}`}
                    style={{ width: driver.impact_magnitude === 'high' ? '90%' : driver.impact_magnitude === 'medium' ? '55%' : '25%' }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
