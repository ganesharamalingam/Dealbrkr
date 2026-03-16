// =========================================
// Assumption Tracker
// =========================================

import { Assumption, DealInput, SourceType, ImpactLevel } from '../types/deal'
import { DEFAULT_BLENDED_RATES, DEFAULT_FTE_ANNUAL_HOURS } from './benchmarks'

export function collectAssumptions(input: DealInput): Assumption[] {
  const assumptions: Assumption[] = []

  const add = (name: string, value: string | number, source: SourceType, impact: ImpactLevel) => {
    assumptions.push({ assumption_name: name, value, source, impact_level: impact })
  }

  // FTE hours
  if (input.fte_annual_hours === DEFAULT_FTE_ANNUAL_HOURS) {
    add('FTE Annual Productive Hours', input.fte_annual_hours, 'inferred', 'medium')
  } else {
    add('FTE Annual Productive Hours', input.fte_annual_hours, 'user', 'medium')
  }

  // Blended rate
  if (input.blended_rate) {
    add('Blended Rate', `${input.currency} ${input.blended_rate}/hr`, 'user', 'high')
  } else {
    const rate = DEFAULT_BLENDED_RATES[input.currency] || 65
    add('Blended Rate', `${input.currency} ${rate}/hr`, 'inferred', 'high')
  }

  // Contract term
  add('Contract Term', `${input.contract_term_months} months`, 'user', 'medium')

  // SLA coverage
  add('SLA Coverage Window', `${input.sla_coverage_hours} hours/day`, 'user', 'medium')

  // Work categories
  input.work_categories.forEach((wc, i) => {
    add(
      `${wc.name || `Category ${i + 1}`} — Volume`,
      `${wc.volume} ${wc.volume_unit}`,
      wc.volume > 0 ? 'user' : 'inferred',
      'high'
    )
    add(
      `${wc.name || `Category ${i + 1}`} — AHT`,
      `${wc.aht_hours} hours`,
      'user',
      'high'
    )
    add(
      `${wc.name || `Category ${i + 1}`} — Complexity`,
      wc.complexity,
      'user',
      'medium'
    )
  })

  // AI compression
  add('AI Compression Model', 'Benchmark-based bounded range per category', 'inferred', 'high')

  // Glidepath
  add('3-Year Glidepath Ramp', 'Y1: 60-85% of max compression, Y2: 80-95%, Y3: 100%', 'inferred', 'medium')

  return assumptions
}
