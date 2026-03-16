import { WorkCategory, ScenarioType, isProjectBased } from '../../types/deal'
import { COMPLEXITY_MULTIPLIERS } from '../../engine/benchmarks'

interface Props {
  categories: WorkCategory[]
  contractMonths: number
  projectDurationWeeks: number
  scenarioType: ScenarioType
}

export function VolumeDrivers({ categories, contractMonths, projectDurationWeeks, scenarioType }: Props) {
  if (categories.length === 0) return null

  const projectBased = isProjectBased(scenarioType)

  const rows = categories.map(cat => {
    const mult = COMPLEXITY_MULTIPLIERS[cat.complexity]
    const baseHours = cat.volume * cat.aht_hours * mult
    const totalHours = projectBased ? baseHours : baseHours * contractMonths
    return { cat, baseHours, totalHours }
  })

  const grandTotal = rows.reduce((s, r) => s + r.totalHours, 0)
  const durationLabel = projectBased
    ? `${projectDurationWeeks}wk project`
    : `${contractMonths}mo`

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-surface-3">
            <th className="text-left py-2 pr-3 text-ink-3 font-medium">Category</th>
            <th className="text-right py-2 px-2 text-ink-3 font-medium">Volume</th>
            <th className="text-right py-2 px-2 text-ink-3 font-medium">AHT</th>
            <th className="text-right py-2 px-2 text-ink-3 font-medium">Complexity</th>
            <th className="text-right py-2 pl-2 text-ink-3 font-medium">
              {projectBased ? 'Total Hrs' : 'Mo. Hrs / Total Hrs'}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ cat, baseHours, totalHours }) => (
            <tr key={cat.id} className="border-b border-surface-2 hover:bg-surface-1">
              <td className="py-1.5 pr-3 text-ink-1 font-medium truncate max-w-[140px]">
                {cat.name || <span className="text-ink-4 italic">Unnamed</span>}
              </td>
              <td className="py-1.5 px-2 text-right text-ink-2 font-mono">
                {cat.volume.toLocaleString()} <span className="text-ink-4">{cat.volume_unit}</span>
              </td>
              <td className="py-1.5 px-2 text-right text-ink-2 font-mono">{cat.aht_hours}h</td>
              <td className="py-1.5 px-2 text-right">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  cat.complexity === 'high' ? 'bg-red-50 text-red-600' :
                  cat.complexity === 'low' ? 'bg-emerald-50 text-emerald-600' :
                  'bg-amber-50 text-amber-600'
                }`}>
                  {cat.complexity}
                </span>
              </td>
              <td className="py-1.5 pl-2 text-right text-ink-1 font-mono font-semibold">
                {projectBased
                  ? totalHours.toFixed(0)
                  : <>{baseHours.toFixed(0)} <span className="text-ink-4">/ {totalHours.toFixed(0)}</span></>
                }
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} className="py-2 pr-2 text-right text-xs font-semibold text-ink-2">
              Total Pre-AI Hours ({durationLabel})
            </td>
            <td className="py-2 pl-2 text-right text-sm font-bold text-brand-700 font-mono">
              {grandTotal.toFixed(0)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
