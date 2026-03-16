import { DealInput } from '../../types/deal'
import { Input } from '../shared/Input'
import { Card, CardHeader, CardTitle } from '../shared/Card'
import { Button } from '../shared/Button'
import { ScenarioSelector } from './ScenarioSelector'
import { ScopeBuilder } from './ScopeBuilder'
import { RateInput } from './RateInput'
import { RawRFPInput } from './RawRFPInput'
import { VolumeDrivers } from './VolumeDrivers'
import { Zap, RotateCcw, FileText, List } from 'lucide-react'
import { clsx } from 'clsx'

interface Props {
  input: DealInput
  onUpdate: (updates: Partial<DealInput>) => void
  onEstimate: () => void
  onReset: () => void
  error: string | null
}

export function DealInputForm({ input, onUpdate, onEstimate, onReset, error }: Props) {
  const isRFP = input.input_mode === 'rfp_paste'

  return (
    <div className="space-y-4">
      {/* Deal Meta */}
      <Card padding="sm">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Deal Name"
            value={input.deal_name}
            onChange={e => onUpdate({ deal_name: e.target.value })}
            placeholder="e.g. ACME Managed Services RFP"
          />
          <Input
            label="Client Name"
            value={input.client_name}
            onChange={e => onUpdate({ client_name: e.target.value })}
            placeholder="e.g. ACME Corp"
          />
        </div>
      </Card>

      {/* Scenario */}
      <Card padding="sm">
        <CardHeader>
          <CardTitle>Scenario Type</CardTitle>
        </CardHeader>
        <ScenarioSelector
          value={input.scenario_type}
          onChange={v => onUpdate({ scenario_type: v })}
        />
      </Card>

      {/* Input Mode Toggle */}
      <div className="flex rounded-lg border border-surface-3 bg-surface-1 p-1 gap-1">
        <button
          onClick={() => onUpdate({ input_mode: 'structured' })}
          className={clsx(
            'flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all',
            !isRFP
              ? 'bg-white text-ink-0 shadow-card'
              : 'text-ink-3 hover:text-ink-2'
          )}
        >
          <List className="w-4 h-4" />
          Structured Input
        </button>
        <button
          onClick={() => onUpdate({ input_mode: 'rfp_paste' })}
          className={clsx(
            'flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all',
            isRFP
              ? 'bg-white text-ink-0 shadow-card'
              : 'text-ink-3 hover:text-ink-2'
          )}
        >
          <FileText className="w-4 h-4" />
          Paste RFP Text
        </button>
      </div>

      {/* Input Section */}
      {isRFP ? (
        <Card padding="sm">
          <CardHeader>
            <CardTitle>RFP / Deal Text</CardTitle>
          </CardHeader>
          <RawRFPInput
            rfpText={input.raw_rfp_text || ''}
            onRFPTextChange={text => onUpdate({ raw_rfp_text: text })}
            onApply={updates => onUpdate({ ...updates, input_mode: 'structured' })}
          />
        </Card>
      ) : (
        <>
          <Card padding="sm">
            <CardHeader>
              <CardTitle>Work Categories &amp; Scope</CardTitle>
            </CardHeader>
            <ScopeBuilder
              categories={input.work_categories}
              onChange={cats => onUpdate({ work_categories: cats })}
            />
          </Card>

          {input.work_categories.length > 0 && (
            <Card padding="sm">
              <CardHeader>
                <CardTitle>Volume Preview</CardTitle>
              </CardHeader>
              <VolumeDrivers
                categories={input.work_categories}
                contractMonths={input.contract_term_months}
              />
            </Card>
          )}
        </>
      )}

      {/* Commercial Parameters */}
      <Card padding="sm">
        <CardHeader>
          <CardTitle>Commercial Parameters</CardTitle>
        </CardHeader>
        <RateInput input={input} onChange={onUpdate} />
      </Card>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
          {error}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          size="lg"
          icon={<Zap className="w-5 h-5" />}
          onClick={onEstimate}
          className="flex-1"
          disabled={input.work_categories.length === 0}
        >
          Generate Estimate
        </Button>
        <Button
          variant="ghost"
          size="lg"
          icon={<RotateCcw className="w-4 h-4" />}
          onClick={onReset}
          title="Reset all inputs"
        >
          Reset
        </Button>
      </div>
    </div>
  )
}
