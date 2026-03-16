import { AICompression } from '../../types/deal'

interface Props {
  compression: AICompression
}

function RangePill({ value, color }: { value: number; color: string }) {
  return (
    <span className={`font-mono font-semibold ${color}`}>{value.toFixed(1)}%</span>
  )
}

export function AICompressionCard({ compression }: Props) {
  return (
    <div className="space-y-6">
      {/* Overall compression */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Conservative', value: compression.min_percent, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Expected', value: compression.expected_percent, color: 'text-brand-600', bg: 'bg-brand-50 border-brand-200' },
          { label: 'Aggressive', value: compression.max_percent, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`text-center p-4 rounded-xl border ${bg}`}>
            <div className="text-xs text-ink-3 mb-1">{label}</div>
            <div className={`text-2xl font-bold font-mono ${color}`}>{value.toFixed(1)}%</div>
            <div className="text-[10px] text-ink-4 mt-0.5">AI compression</div>
          </div>
        ))}
      </div>

      <p className="text-xs text-ink-3 bg-surface-1 rounded-lg px-3 py-2">
        Ranges are weighted by volume across categories. Complexity tier adjusts each category's compressibility.
        Conservative = min AI maturity assumed; Aggressive = full AI toolchain deployed.
      </p>

      {/* Per-category table */}
      <div>
        <h4 className="text-sm font-semibold text-ink-2 mb-3 uppercase tracking-wide">By Category</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-surface-3 text-ink-3">
                <th className="text-left py-2 pr-4 font-medium">Category</th>
                <th className="text-center py-2 px-2 font-medium">Min %</th>
                <th className="text-center py-2 px-2 font-medium">Expected %</th>
                <th className="text-center py-2 px-2 font-medium">Max %</th>
                <th className="text-left py-2 pl-4 font-medium">AI Rationale</th>
              </tr>
            </thead>
            <tbody>
              {compression.by_category.map(cat => (
                <tr key={cat.category_id} className="border-b border-surface-2 hover:bg-surface-1 align-top">
                  <td className="py-2 pr-4 text-ink-1 font-medium max-w-[140px]">
                    {cat.category_name || 'Unnamed'}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <RangePill value={cat.min_percent} color="text-amber-600" />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <RangePill value={cat.expected_percent} color="text-brand-600" />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <RangePill value={cat.max_percent} color="text-emerald-600" />
                  </td>
                  <td className="py-2 pl-4 text-ink-3 leading-relaxed max-w-xs">
                    {cat.rationale}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual range bars */}
      <div>
        <h4 className="text-sm font-semibold text-ink-2 mb-3 uppercase tracking-wide">Range Visualization</h4>
        <div className="space-y-3">
          {compression.by_category.map(cat => (
            <div key={cat.category_id} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-ink-2 font-medium truncate max-w-[60%]">{cat.category_name || 'Unnamed'}</span>
                <span className="text-ink-3 font-mono">{cat.min_percent}% – {cat.max_percent}%</span>
              </div>
              <div className="relative h-3 bg-surface-3 rounded-full overflow-hidden">
                {/* Min range */}
                <div
                  className="absolute top-0 h-full bg-amber-200 rounded-full"
                  style={{ left: 0, width: `${cat.min_percent}%` }}
                />
                {/* Expected */}
                <div
                  className="absolute top-0 h-full bg-brand-400 rounded-full"
                  style={{ left: 0, width: `${cat.expected_percent}%` }}
                />
                {/* Max */}
                <div
                  className="absolute top-0 h-full border-r-2 border-emerald-500"
                  style={{ left: 0, width: `${cat.max_percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
