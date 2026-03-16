import { DealInput } from '../../types/deal'
import { Input } from '../shared/Input'
import { Select } from '../shared/Select'

interface Props {
  input: DealInput
  onChange: (updates: Partial<DealInput>) => void
}

const currencyOptions = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'INR', label: 'INR (₹)' },
  { value: 'AUD', label: 'AUD (A$)' },
]

export function RateInput({ input, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Select
          label="Currency"
          options={currencyOptions}
          value={input.currency}
          onChange={e => onChange({ currency: e.target.value })}
        />
        <Input
          label="Blended Rate (per hr)"
          type="number"
          min={0}
          step={1}
          value={input.blended_rate || ''}
          onChange={e => onChange({ blended_rate: parseFloat(e.target.value) || undefined })}
          placeholder="65 (inferred if blank)"
          hint="Leave blank to use benchmark"
        />
        <Input
          label="Revenue Proposed"
          type="number"
          min={0}
          value={input.revenue_proposed || ''}
          onChange={e => onChange({ revenue_proposed: parseFloat(e.target.value) || undefined })}
          placeholder="Optional — enables margin calc"
          hint="Full contract revenue"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Input
          label="Contract Term (months)"
          type="number"
          min={1}
          max={120}
          value={input.contract_term_months}
          onChange={e => onChange({ contract_term_months: parseInt(e.target.value) || 36 })}
        />
        <Input
          label="SLA Coverage (hrs/day)"
          type="number"
          min={1}
          max={24}
          value={input.sla_coverage_hours}
          onChange={e => onChange({ sla_coverage_hours: parseInt(e.target.value) || 12 })}
          hint="8=business hrs, 12=extended, 24=24×7"
        />
        <Input
          label="FTE Annual Hours"
          type="number"
          min={1000}
          max={2200}
          value={input.fte_annual_hours}
          onChange={e => onChange({ fte_annual_hours: parseInt(e.target.value) || 1920 })}
          hint="Default: 1920 (40hrs × 48 weeks)"
        />
      </div>
    </div>
  )
}
