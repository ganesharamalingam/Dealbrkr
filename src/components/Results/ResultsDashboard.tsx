import { useState } from 'react'
import { DealOutput } from '../../types/deal'
import { Card, CardHeader, CardTitle } from '../shared/Card'
import { Badge } from '../shared/Badge'
import { Button } from '../shared/Button'
import { EffortCard } from './EffortCard'
import { AICompressionCard } from './AICompressionCard'
import { CommercialCard } from './CommercialCard'
import { GlidepathChart } from './GlidepathChart'
import { AssumptionsTable } from './AssumptionsTable'
import { SensitivityPanel } from './SensitivityPanel'
import { JSONOutput } from './JSONOutput'
import { exportExcel } from '../../utils/exportExcel'
import { exportJSON } from '../../utils/exportJSON'
import { formatCurrency, formatNumber } from '../../utils/formatters'
import { Download, FileJson, BarChart3, Zap, DollarSign, TrendingUp, AlertTriangle, BookOpen, Code2 } from 'lucide-react'
import { clsx } from 'clsx'

interface Props {
  output: DealOutput
}

type TabId = 'overview' | 'effort' | 'ai' | 'commercial' | 'glidepath' | 'assumptions' | 'sensitivity' | 'json'

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'effort', label: 'Effort', icon: Zap },
  { id: 'ai', label: 'AI Compression', icon: TrendingUp },
  { id: 'commercial', label: 'Commercial', icon: DollarSign },
  { id: 'glidepath', label: 'Glidepath', icon: TrendingUp },
  { id: 'assumptions', label: 'Assumptions', icon: BookOpen },
  { id: 'sensitivity', label: 'Sensitivity', icon: AlertTriangle },
  { id: 'json', label: 'JSON', icon: Code2 },
]

const confidenceVariant = (c: string): 'success' | 'warning' | 'danger' => {
  if (c === 'High') return 'success'
  if (c === 'Medium') return 'warning'
  return 'danger'
}

export function ResultsDashboard({ output }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const currency = output.commercial_estimate.blended_rate_used ? 'USD' : 'USD'
  const annualPreAICost = output.commercial_estimate.total_cost_pre_ai / (output.scope_summary.contract_months / 12)

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-ink-0">{output.deal_name}</h2>
          <p className="text-sm text-ink-3">{output.client_name} · {output.scenario_type.replace(/_/g, ' ')}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={confidenceVariant(output.confidence_level)}>
            {output.confidence_level} confidence
          </Badge>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={() => exportExcel(output)}
          >
            Excel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<FileJson className="w-4 h-4" />}
            onClick={() => exportJSON(output)}
          >
            JSON
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Pre-AI Cost',
              value: formatCurrency(output.commercial_estimate.total_cost_pre_ai, currency),
              sub: `${output.scope_summary.contract_months}mo total`,
              color: 'text-ink-0',
            },
            {
              label: 'Expected Post-AI Cost',
              value: formatCurrency(output.commercial_estimate.total_cost_post_ai_expected, currency),
              sub: 'Expected compression',
              color: 'text-brand-700',
            },
            {
              label: 'AI Savings (Expected)',
              value: formatCurrency(
                output.commercial_estimate.total_cost_pre_ai - output.commercial_estimate.total_cost_post_ai_expected,
                currency
              ),
              sub: `${output.ai_compression.expected_percent}% compression`,
              color: 'text-emerald-600',
            },
            {
              label: 'FTE (Post-AI Exp)',
              value: output.effort_estimate.fte_equivalent_post_ai_expected.toString(),
              sub: `vs ${output.effort_estimate.fte_equivalent_pre_ai} pre-AI`,
              color: 'text-ink-0',
            },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="bg-white border border-surface-3 rounded-xl p-4 shadow-card text-center">
              <div className="text-xs text-ink-3 mb-1">{label}</div>
              <div className={`text-xl font-bold font-mono ${color}`}>{value}</div>
              <div className="text-[10px] text-ink-4 mt-0.5">{sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex overflow-x-auto gap-1 bg-surface-1 rounded-xl p-1 border border-surface-3 scrollbar-none">
        {tabs.map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
                active
                  ? 'bg-white text-ink-0 shadow-card'
                  : 'text-ink-3 hover:text-ink-2 hover:bg-surface-2'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <Card>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Scope summary */}
            <div>
              <h4 className="text-sm font-semibold text-ink-2 mb-3 uppercase tracking-wide">Scope Summary</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Work Categories', value: output.scope_summary.total_categories },
                  { label: 'Total Volume', value: formatNumber(output.scope_summary.total_volume) },
                  { label: 'Coverage', value: `${output.scope_summary.coverage_hours}h/day` },
                  { label: 'Contract', value: `${output.scope_summary.contract_months}mo` },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center p-3 bg-surface-1 rounded-lg">
                    <div className="text-xs text-ink-3 mb-1">{label}</div>
                    <div className="text-lg font-bold font-mono text-ink-0">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI compression summary */}
            <div>
              <h4 className="text-sm font-semibold text-ink-2 mb-3 uppercase tracking-wide">AI Compression Range</h4>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-3 bg-surface-3 rounded-full relative overflow-hidden">
                  <div
                    className="absolute top-0 h-full bg-amber-300 rounded-full"
                    style={{ width: `${output.ai_compression.min_percent * 2}%` }}
                  />
                  <div
                    className="absolute top-0 h-full bg-brand-400 rounded-full"
                    style={{ width: `${output.ai_compression.expected_percent * 2}%` }}
                  />
                  <div
                    className="absolute top-0 h-full border-r-2 border-emerald-500"
                    style={{ width: `${output.ai_compression.max_percent * 2}%` }}
                  />
                </div>
                <div className="text-xs font-mono whitespace-nowrap text-ink-2">
                  {output.ai_compression.min_percent}% – {output.ai_compression.max_percent}%
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-ink-4 mt-1">
                <span>Conservative ({output.ai_compression.min_percent}%)</span>
                <span>Expected ({output.ai_compression.expected_percent}%)</span>
                <span>Aggressive ({output.ai_compression.max_percent}%)</span>
              </div>
            </div>

            {/* Glidepath preview */}
            <div>
              <h4 className="text-sm font-semibold text-ink-2 mb-3 uppercase tracking-wide">3-Year Cost Glidepath</h4>
              <GlidepathChart
                glidepath={output.glidepath_3_year}
                currency={currency}
                preAICostAnnual={annualPreAICost}
              />
            </div>

            {/* Generation metadata */}
            <div className="text-xs text-ink-4 pt-2 border-t border-surface-3">
              Generated: {new Date(output.generated_at).toLocaleString()} · DealBrkr v1.0
            </div>
          </div>
        )}

        {activeTab === 'effort' && (
          <EffortCard effort={output.effort_estimate} />
        )}

        {activeTab === 'ai' && (
          <AICompressionCard compression={output.ai_compression} />
        )}

        {activeTab === 'commercial' && (
          <CommercialCard commercial={output.commercial_estimate} currency={currency} />
        )}

        {activeTab === 'glidepath' && (
          <GlidepathChart
            glidepath={output.glidepath_3_year}
            currency={currency}
            preAICostAnnual={annualPreAICost}
          />
        )}

        {activeTab === 'assumptions' && (
          <AssumptionsTable assumptions={output.assumptions} />
        )}

        {activeTab === 'sensitivity' && (
          <SensitivityPanel drivers={output.sensitivity_drivers} />
        )}

        {activeTab === 'json' && (
          <JSONOutput output={output} />
        )}
      </Card>
    </div>
  )
}
