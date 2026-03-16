import { useState } from 'react'
import { DealInput } from '../../types/deal'
import { parseRFPText } from '../../utils/parseRFP'
import { Button } from '../shared/Button'
import { FileText, Wand2, AlertCircle } from 'lucide-react'

interface Props {
  rfpText: string
  onRFPTextChange: (text: string) => void
  onApply: (updates: Partial<DealInput>) => void
}

const SAMPLE_RFP = `Project: Managed IT Services for RetailCorp Global

We are seeking an IT managed services partner for a 3-year engagement.

Scope:
- Incident Management: approximately 3,000 tickets per month (L1/L2)
- Service Requests: 800 requests per month (provisioning, access)
- Monitoring & Alerting: 5,000 alerts per month (NOC support)
- Patch Management: 200 servers, monthly patching cycle
- Reporting & Analytics: Weekly and monthly executive dashboards

SLA: 12x5 with P1 response in 15 minutes
Contract value: $4.5 million over 3 years
Rate assumption: $65/hr blended`

export function RawRFPInput({ rfpText, onRFPTextChange, onApply }: Props) {
  const [parsed, setParsed] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)

  const handleParse = () => {
    setParseError(null)
    setParsed(false)
    try {
      const result = parseRFPText(rfpText)
      if (result.categories.length === 0) {
        setParseError('Could not extract structured data. Try adding volume numbers like "2000 tickets/month".')
        return
      }
      onApply({
        scenario_type: result.scenario_type,
        deal_name: result.deal_name,
        work_categories: result.categories,
        blended_rate: result.blended_rate,
        revenue_proposed: result.revenue,
        contract_term_months: result.contract_months,
      })
      setParsed(true)
    } catch {
      setParseError('Parsing failed. Please check your input.')
    }
  }

  const loadSample = () => {
    onRFPTextChange(SAMPLE_RFP)
    setParsed(false)
    setParseError(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-ink-2">
          <FileText className="w-4 h-4 text-ink-3" />
          <span>Paste raw RFP or deal description text</span>
        </div>
        <Button variant="ghost" size="sm" onClick={loadSample}>
          Load sample
        </Button>
      </div>

      <textarea
        value={rfpText}
        onChange={e => { onRFPTextChange(e.target.value); setParsed(false); setParseError(null) }}
        rows={12}
        placeholder={`Paste RFP text here...\n\nExamples of what gets extracted:\n• "3,000 tickets per month" → Incident Management category\n• "800 requests/month" → Service Requests category\n• "3 year" or "36 months" → contract term\n• "budget: $4.5 million" → revenue\n• "$65/hr" → blended rate`}
        className="block w-full rounded-xl border border-surface-4 bg-white px-4 py-3 text-sm text-ink-0 placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors font-mono resize-y"
      />

      {parseError && (
        <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2.5">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{parseError}</span>
        </div>
      )}

      {parsed && (
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2.5">
          <span className="text-base">✓</span>
          <span>RFP parsed successfully. Work categories populated — switch to Structured mode to review and adjust.</span>
        </div>
      )}

      <Button
        variant="primary"
        icon={<Wand2 className="w-4 h-4" />}
        onClick={handleParse}
        disabled={!rfpText.trim()}
        className="w-full"
      >
        Parse RFP → Auto-fill Scope
      </Button>

      <p className="text-xs text-ink-4">
        Parser extracts: volume numbers, units, contract duration, blended rate, revenue. Review and adjust in Structured mode after parsing.
      </p>
    </div>
  )
}
