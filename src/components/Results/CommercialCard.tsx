import { CommercialEstimate } from '../../types/deal'
import { formatCurrency } from '../../utils/formatters'

interface Props {
  commercial: CommercialEstimate
  currency: string
}

interface RowProps {
  label: string
  preAI: string
  min: string
  expected: string
  max: string
  isHighlight?: boolean
  isMargin?: boolean
  marginPreAI?: number | null
  marginExp?: number | null
  marginMax?: number | null
}

function CostRow({ label, preAI, min, expected, max, isHighlight, isMargin, marginPreAI, marginExp, marginMax }: RowProps) {
  const rowClass = isHighlight
    ? 'bg-brand-50 font-semibold text-ink-0'
    : 'hover:bg-surface-1 text-ink-1'

  const marginColor = (v: number | null | undefined) => {
    if (v === null || v === undefined) return 'text-ink-4'
    if (v >= 30) return 'text-emerald-600'
    if (v >= 15) return 'text-amber-600'
    return 'text-red-600'
  }

  return (
    <tr className={`border-b border-surface-2 ${rowClass}`}>
      <td className="py-3 pr-4 text-sm">{label}</td>
      <td className="py-3 px-2 text-right text-sm font-mono">
        {isMargin
          ? <span className={marginColor(marginPreAI)}>{marginPreAI !== null && marginPreAI !== undefined ? `${marginPreAI}%` : '—'}</span>
          : preAI}
      </td>
      <td className="py-3 px-2 text-right text-sm font-mono text-amber-700">
        {isMargin
          ? <span className={marginColor(marginPreAI)}>{min !== '—' ? min : '—'}</span>
          : min}
      </td>
      <td className="py-3 px-2 text-right text-sm font-mono text-brand-700">
        {isMargin
          ? <span className={marginColor(marginExp)}>{marginExp !== null && marginExp !== undefined ? `${marginExp}%` : '—'}</span>
          : expected}
      </td>
      <td className="py-3 pl-2 text-right text-sm font-mono text-emerald-700">
        {isMargin
          ? <span className={marginColor(marginMax)}>{marginMax !== null && marginMax !== undefined ? `${marginMax}%` : '—'}</span>
          : max}
      </td>
    </tr>
  )
}

export function CommercialCard({ commercial, currency }: Props) {
  const fmt = (v: number) => formatCurrency(v, currency)

  return (
    <div className="space-y-6">
      {/* Rate used */}
      <div className="flex items-center gap-4 p-4 bg-surface-1 rounded-xl">
        <div>
          <div className="text-xs text-ink-3">Blended Rate Applied</div>
          <div className="text-2xl font-bold font-mono text-ink-0">
            {currency} {commercial.blended_rate_used}/hr
          </div>
        </div>
        {commercial.revenue_proposed && (
          <>
            <div className="h-10 w-px bg-surface-4" />
            <div>
              <div className="text-xs text-ink-3">Revenue Proposed</div>
              <div className="text-2xl font-bold font-mono text-ink-0">
                {fmt(commercial.revenue_proposed)}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-3">
              <th className="text-left py-2 pr-4 text-xs text-ink-3 font-medium">Metric</th>
              <th className="text-right py-2 px-2 text-xs text-ink-3 font-medium">Pre-AI</th>
              <th className="text-right py-2 px-2 text-xs text-amber-600 font-medium">Min Compression</th>
              <th className="text-right py-2 px-2 text-xs text-brand-600 font-medium">Expected</th>
              <th className="text-right py-2 pl-2 text-xs text-emerald-600 font-medium">Max Compression</th>
            </tr>
          </thead>
          <tbody>
            <CostRow
              label="Total Delivery Cost"
              preAI={fmt(commercial.total_cost_pre_ai)}
              min={fmt(commercial.total_cost_post_ai_min)}
              expected={fmt(commercial.total_cost_post_ai_expected)}
              max={fmt(commercial.total_cost_post_ai_max)}
              isHighlight
            />
            <CostRow
              label="Cost Savings vs Pre-AI"
              preAI="—"
              min={fmt(commercial.total_cost_pre_ai - commercial.total_cost_post_ai_min)}
              expected={fmt(commercial.total_cost_pre_ai - commercial.total_cost_post_ai_expected)}
              max={fmt(commercial.total_cost_pre_ai - commercial.total_cost_post_ai_max)}
            />
            {commercial.revenue_proposed && (
              <CostRow
                label="Gross Margin"
                preAI="—"
                min="—"
                expected="—"
                max="—"
                isMargin
                marginPreAI={commercial.margin_pre_ai}
                marginExp={commercial.margin_post_ai_expected}
                marginMax={commercial.margin_post_ai_max}
              />
            )}
          </tbody>
        </table>
      </div>

      {/* AI savings callout */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'Conservative Savings',
            value: fmt(commercial.total_cost_pre_ai - commercial.total_cost_post_ai_min),
            sub: 'Min AI compression',
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            label: 'Expected Savings',
            value: fmt(commercial.total_cost_pre_ai - commercial.total_cost_post_ai_expected),
            sub: 'Expected AI compression',
            color: 'text-brand-700',
            bg: 'bg-brand-50',
          },
          {
            label: 'Upside Savings',
            value: fmt(commercial.total_cost_pre_ai - commercial.total_cost_post_ai_max),
            sub: 'Max AI compression',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
        ].map(({ label, value, sub, color, bg }) => (
          <div key={label} className={`rounded-xl p-4 ${bg} text-center`}>
            <div className="text-xs text-ink-3 mb-1">{label}</div>
            <div className={`text-lg font-bold font-mono ${color}`}>{value}</div>
            <div className="text-[10px] text-ink-4 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {!commercial.revenue_proposed && (
        <p className="text-xs text-ink-4 bg-surface-1 rounded-lg px-3 py-2">
          Margin calculation not available — enter Revenue Proposed in Commercial Parameters to enable margin simulation.
        </p>
      )}
    </div>
  )
}
