import { Assumption } from '../../types/deal'
import { Badge } from '../shared/Badge'

interface Props {
  assumptions: Assumption[]
}

export function AssumptionsTable({ assumptions }: Props) {
  const sourceVariant = (s: string): 'info' | 'warning' =>
    s === 'user' ? 'info' : 'warning'

  const impactVariant = (i: string): 'danger' | 'warning' | 'default' =>
    i === 'high' ? 'danger' : i === 'medium' ? 'warning' : 'default'

  const userAssumptions = assumptions.filter(a => a.source === 'user')
  const inferredAssumptions = assumptions.filter(a => a.source === 'inferred')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 text-xs text-ink-3">
        <div className="flex items-center gap-1.5">
          <Badge variant="info">user</Badge>
          <span>Value provided in input</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="warning">inferred</Badge>
          <span>Benchmark/default applied</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="danger">high</Badge>
          <span>Materially impacts cost</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-3 text-ink-3 text-xs">
              <th className="text-left py-2 pr-6 font-medium">Assumption</th>
              <th className="text-left py-2 pr-4 font-medium">Value</th>
              <th className="text-center py-2 px-2 font-medium">Source</th>
              <th className="text-center py-2 pl-2 font-medium">Impact</th>
            </tr>
          </thead>
          <tbody>
            {[...userAssumptions, ...inferredAssumptions].map((a, i) => (
              <tr
                key={i}
                className={`border-b border-surface-2 hover:bg-surface-1 ${a.source === 'inferred' ? 'opacity-75' : ''}`}
              >
                <td className="py-2 pr-6 text-ink-1 text-xs">{a.assumption_name}</td>
                <td className="py-2 pr-4 font-mono text-ink-2 text-xs">{String(a.value)}</td>
                <td className="py-2 px-2 text-center">
                  <Badge variant={sourceVariant(a.source)}>{a.source}</Badge>
                </td>
                <td className="py-2 pl-2 text-center">
                  <Badge variant={impactVariant(a.impact_level)}>{a.impact_level}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-ink-4">
        {userAssumptions.length} user-provided · {inferredAssumptions.length} inferred from benchmarks.
        All inferred values should be reviewed and replaced with actuals for higher confidence.
      </p>
    </div>
  )
}
