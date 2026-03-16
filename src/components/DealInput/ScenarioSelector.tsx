import { ScenarioType } from '../../types/deal'
import { clsx } from 'clsx'
import { Settings, Rocket, Box, Clock, Layers } from 'lucide-react'

interface Props {
  value: ScenarioType
  onChange: (v: ScenarioType) => void
}

const scenarios: { value: ScenarioType; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'managed_services', label: 'Managed Services', icon: Settings, desc: 'Ongoing ops & support' },
  { value: 'greenfield_implementation', label: 'Greenfield / Impl', icon: Rocket, desc: 'New build & setup' },
  { value: 'product_feature_development', label: 'Product / Feature', icon: Box, desc: 'Feature development' },
  { value: 'tm_capacity', label: 'T&M / Capacity', icon: Clock, desc: 'Staff augmentation' },
  { value: 'hybrid', label: 'Hybrid', icon: Layers, desc: 'Mixed model' },
]

export function ScenarioSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {scenarios.map(s => {
        const Icon = s.icon
        const active = value === s.value
        return (
          <button
            key={s.value}
            onClick={() => onChange(s.value)}
            className={clsx(
              'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center',
              active
                ? 'border-brand-600 bg-brand-50 text-brand-700'
                : 'border-surface-3 bg-white text-ink-2 hover:border-surface-4 hover:bg-surface-1'
            )}
          >
            <Icon className={clsx('w-5 h-5', active ? 'text-brand-600' : 'text-ink-3')} />
            <span className="text-xs font-semibold">{s.label}</span>
            <span className="text-[10px] text-ink-3">{s.desc}</span>
          </button>
        )
      })}
    </div>
  )
}
