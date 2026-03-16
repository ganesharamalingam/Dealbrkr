import { Glidepath3Year } from '../../types/deal'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { formatCompact, formatCurrency } from '../../utils/formatters'

interface Props {
  glidepath: Glidepath3Year
  currency: string
  preAICostAnnual: number
}

interface TooltipPayload {
  color: string
  name: string
  value: number
  payload: ChartDataPoint
}

interface ChartDataPoint {
  year: string
  Conservative: number
  Expected: number
  Aggressive: number
  conservative_fte: number
  expected_fte: number
  aggressive_fte: number
  conservative_comp: number
  expected_comp: number
  aggressive_comp: number
}

const CustomTooltip = ({ active, payload, label, currency }: {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
  currency: string
}) => {
  if (!active || !payload?.length) return null
  const p = payload[0]?.payload as ChartDataPoint

  return (
    <div className="bg-white border border-surface-3 rounded-xl shadow-elevated p-3 text-xs space-y-2">
      <div className="font-semibold text-ink-0 mb-2">{label}</div>
      {payload.map((entry) => {
        const fte = entry.name === 'Conservative' ? p.conservative_fte :
                    entry.name === 'Expected' ? p.expected_fte : p.aggressive_fte
        const comp = entry.name === 'Conservative' ? p.conservative_comp :
                     entry.name === 'Expected' ? p.expected_comp : p.aggressive_comp
        return (
          <div key={entry.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
            <span className="text-ink-2 w-24">{entry.name}</span>
            <span className="font-mono font-semibold text-ink-0">{formatCurrency(entry.value, currency)}</span>
            <span className="text-ink-4">|</span>
            <span className="text-ink-3">{fte} FTE</span>
            <span className="text-ink-4">|</span>
            <span className="text-ink-3">{comp}% AI</span>
          </div>
        )
      })}
    </div>
  )
}

export function GlidepathChart({ glidepath, currency, preAICostAnnual }: Props) {
  const data: ChartDataPoint[] = glidepath.years.map(y => ({
    year: `Year ${y.year}`,
    Conservative: y.conservative_cost,
    Expected: y.expected_cost,
    Aggressive: y.aggressive_cost,
    conservative_fte: y.conservative_fte,
    expected_fte: y.expected_fte,
    aggressive_fte: y.aggressive_fte,
    conservative_comp: y.conservative_compression,
    expected_comp: y.expected_compression,
    aggressive_comp: y.aggressive_compression,
  }))

  return (
    <div className="space-y-6">
      <div className="text-xs text-ink-3 bg-surface-1 rounded-lg px-3 py-2.5">
        Glidepath shows annual delivery cost as AI maturity increases over 3 years.
        Conservative ramps to min compression; Aggressive ramps to max compression.
        Pre-AI baseline: <strong className="text-ink-1">{formatCurrency(preAICostAnnual, currency)}/year</strong>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12, fill: '#868e96' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={v => formatCompact(v)}
            tick={{ fontSize: 11, fill: '#868e96' }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip content={<CustomTooltip currency={currency} />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
          />
          <ReferenceLine
            y={preAICostAnnual}
            stroke="#adb5bd"
            strokeDasharray="4 4"
            label={{ value: 'Pre-AI', position: 'right', fontSize: 10, fill: '#868e96' }}
          />
          <Line
            type="monotone"
            dataKey="Conservative"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 5, fill: '#f59e0b' }}
            activeDot={{ r: 7 }}
          />
          <Line
            type="monotone"
            dataKey="Expected"
            stroke="#4263eb"
            strokeWidth={2.5}
            dot={{ r: 5, fill: '#4263eb' }}
            activeDot={{ r: 7 }}
          />
          <Line
            type="monotone"
            dataKey="Aggressive"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 5, fill: '#10b981' }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Year-by-year table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-surface-3 text-ink-3">
              <th className="text-left py-2 pr-4 font-medium">Year</th>
              <th className="text-right py-2 px-2 font-medium text-amber-600">Conservative Cost</th>
              <th className="text-right py-2 px-2 font-medium text-brand-600">Expected Cost</th>
              <th className="text-right py-2 px-2 font-medium text-emerald-600">Aggressive Cost</th>
              <th className="text-right py-2 px-2 font-medium">Exp FTE</th>
              <th className="text-right py-2 pl-2 font-medium">Exp AI%</th>
            </tr>
          </thead>
          <tbody>
            {glidepath.years.map(y => (
              <tr key={y.year} className="border-b border-surface-2 hover:bg-surface-1">
                <td className="py-2 pr-4 font-semibold text-ink-1">Year {y.year}</td>
                <td className="py-2 px-2 text-right font-mono text-amber-700">
                  {formatCurrency(y.conservative_cost, currency)}
                </td>
                <td className="py-2 px-2 text-right font-mono text-brand-700 font-semibold">
                  {formatCurrency(y.expected_cost, currency)}
                </td>
                <td className="py-2 px-2 text-right font-mono text-emerald-700">
                  {formatCurrency(y.aggressive_cost, currency)}
                </td>
                <td className="py-2 px-2 text-right font-mono text-ink-2">{y.expected_fte}</td>
                <td className="py-2 pl-2 text-right font-mono text-ink-2">{y.expected_compression}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
