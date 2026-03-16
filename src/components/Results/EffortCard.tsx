import { EffortEstimate } from '../../types/deal'
import { Card, CardHeader, CardTitle, CardDescription } from '../shared/Card'
import { formatNumber } from '../../utils/formatters'

interface Props {
  effort: EffortEstimate
}

function MetricBlock({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="text-center p-3 bg-surface-1 rounded-lg">
      <div className="text-xs text-ink-3 mb-1">{label}</div>
      <div className="text-xl font-bold text-ink-0 font-mono">{value}</div>
      {sub && <div className="text-xs text-ink-4 mt-0.5">{sub}</div>}
    </div>
  )
}

function CompressionBar({ pre, post, label }: { pre: number; post: number; label: string }) {
  const pct = pre > 0 ? ((pre - post) / pre) * 100 : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-ink-3">
        <span>{label}</span>
        <span className="text-emerald-600 font-medium">−{pct.toFixed(1)}%</span>
      </div>
      <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
        <div className="h-full bg-brand-600 rounded-full" style={{ width: `${Math.min(100, (post / pre) * 100)}%` }} />
      </div>
      <div className="flex justify-between text-[10px] font-mono text-ink-4">
        <span>{formatNumber(post)}h post-AI</span>
        <span>{formatNumber(pre)}h pre-AI</span>
      </div>
    </div>
  )
}

export function EffortCard({ effort }: Props) {
  return (
    <div className="space-y-6">
      {/* Headline metrics */}
      <div>
        <h4 className="text-sm font-semibold text-ink-2 mb-3 uppercase tracking-wide">Total Effort (Contract Period)</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricBlock
            label="Pre-AI Hours"
            value={formatNumber(effort.pre_ai_hours)}
            sub="Baseline"
          />
          <MetricBlock
            label="Post-AI (Min Compression)"
            value={formatNumber(effort.post_ai_hours_min)}
            sub="Conservative"
          />
          <MetricBlock
            label="Post-AI (Expected)"
            value={formatNumber(effort.post_ai_hours_expected)}
            sub="Expected"
          />
          <MetricBlock
            label="Post-AI (Max Compression)"
            value={formatNumber(effort.post_ai_hours_max)}
            sub="Aggressive"
          />
        </div>
      </div>

      {/* FTE equivalents */}
      <div>
        <h4 className="text-sm font-semibold text-ink-2 mb-3 uppercase tracking-wide">FTE Equivalents (Annual)</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricBlock
            label="Pre-AI FTE"
            value={effort.fte_equivalent_pre_ai.toString()}
            sub="Annual avg"
          />
          <MetricBlock
            label="Post-AI FTE (Min)"
            value={effort.fte_equivalent_post_ai_min.toString()}
            sub="Conservative"
          />
          <MetricBlock
            label="Post-AI FTE (Expected)"
            value={effort.fte_equivalent_post_ai_expected.toString()}
            sub="Expected"
          />
          <MetricBlock
            label="Post-AI FTE (Max)"
            value={effort.fte_equivalent_post_ai_max.toString()}
            sub="Aggressive"
          />
        </div>
      </div>

      {/* Per-category breakdown */}
      <div>
        <h4 className="text-sm font-semibold text-ink-2 mb-3 uppercase tracking-wide">Category Breakdown</h4>
        <div className="space-y-3">
          {effort.breakdown_by_category.map(cat => (
            <CompressionBar
              key={cat.category_id}
              pre={cat.pre_ai_hours}
              post={cat.post_ai_hours_expected}
              label={cat.category_name || 'Unnamed'}
            />
          ))}
        </div>
      </div>

      {/* Role breakdown table */}
      {effort.breakdown_by_category.some(c => c.roles.length > 0) && (
        <div>
          <h4 className="text-sm font-semibold text-ink-2 mb-3 uppercase tracking-wide">Role Breakdown (Pre-AI Hours)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-surface-3 text-ink-3">
                  <th className="text-left py-2 pr-4 font-medium">Category</th>
                  <th className="text-left py-2 pr-4 font-medium">Role</th>
                  <th className="text-right py-2 font-medium">Hours</th>
                </tr>
              </thead>
              <tbody>
                {effort.breakdown_by_category.flatMap(cat =>
                  cat.roles.map((role, i) => (
                    <tr key={`${cat.category_id}-${i}`} className="border-b border-surface-2 hover:bg-surface-1">
                      <td className="py-1.5 pr-4 text-ink-2">{i === 0 ? cat.category_name : ''}</td>
                      <td className="py-1.5 pr-4 text-ink-1">{role.role}</td>
                      <td className="py-1.5 text-right font-mono text-ink-1">{formatNumber(role.hours)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
