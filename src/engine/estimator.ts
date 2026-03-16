// =========================================
// Main Estimation Engine
// =========================================

import {
  DealInput, DealOutput, EffortEstimate, CommercialEstimate,
  CategoryEffort, SensitivityDriver, ConfidenceLevel
} from '../types/deal'
import { COMPLEXITY_MULTIPLIERS, DEFAULT_BLENDED_RATES } from './benchmarks'
import { calculateAICompression } from './aiCompression'
import { calculateGlidepath } from './glidepath'
import { collectAssumptions } from './assumptions'

export function runEstimation(input: DealInput): DealOutput {
  const blendedRate = input.blended_rate || DEFAULT_BLENDED_RATES[input.currency] || 65
  const fteHours = input.fte_annual_hours || 1920
  const contractYears = input.contract_term_months / 12

  // 1. Calculate effort per category
  const categoryEfforts: CategoryEffort[] = input.work_categories.map(wc => {
    const complexityMult = COMPLEXITY_MULTIPLIERS[wc.complexity]
    const monthlyHours = wc.volume * wc.aht_hours * complexityMult
    const totalHours = monthlyHours * input.contract_term_months

    // Get AI compression for this category
    const catCompression = calculateAICompression([wc]).by_category[0]

    const postAIHoursExpected = totalHours * (1 - catCompression.expected_percent / 100)

    const roles = wc.roles.map(r => ({
      role: r.role,
      hours: Math.round(totalHours * (r.percentage / 100)),
    }))

    return {
      category_id: wc.id,
      category_name: wc.name,
      pre_ai_hours: Math.round(totalHours),
      post_ai_hours_expected: Math.round(postAIHoursExpected),
      ai_compression_min: catCompression.min_percent,
      ai_compression_expected: catCompression.expected_percent,
      ai_compression_max: catCompression.max_percent,
      roles,
    }
  })

  // 2. Aggregate effort
  const totalPreAIHours = categoryEfforts.reduce((sum, c) => sum + c.pre_ai_hours, 0)
  const aiCompression = calculateAICompression(input.work_categories)

  const postAIHoursMin = totalPreAIHours * (1 - aiCompression.min_percent / 100)
  const postAIHoursExpected = totalPreAIHours * (1 - aiCompression.expected_percent / 100)
  const postAIHoursMax = totalPreAIHours * (1 - aiCompression.max_percent / 100)

  const annualPreAIHours = totalPreAIHours / contractYears

  const effortEstimate: EffortEstimate = {
    pre_ai_hours: Math.round(totalPreAIHours),
    post_ai_hours_min: Math.round(postAIHoursMin),
    post_ai_hours_expected: Math.round(postAIHoursExpected),
    post_ai_hours_max: Math.round(postAIHoursMax),
    fte_equivalent_pre_ai: Math.round((annualPreAIHours / fteHours) * 10) / 10,
    fte_equivalent_post_ai_min: Math.round(((postAIHoursMin / contractYears) / fteHours) * 10) / 10,
    fte_equivalent_post_ai_expected: Math.round(((postAIHoursExpected / contractYears) / fteHours) * 10) / 10,
    fte_equivalent_post_ai_max: Math.round(((postAIHoursMax / contractYears) / fteHours) * 10) / 10,
    breakdown_by_category: categoryEfforts,
  }

  // 3. Commercial estimate
  const revenue = input.revenue_proposed || null
  const costPreAI = Math.round(totalPreAIHours * blendedRate)
  const costPostAIMin = Math.round(postAIHoursMin * blendedRate)
  const costPostAIExpected = Math.round(postAIHoursExpected * blendedRate)
  const costPostAIMax = Math.round(postAIHoursMax * blendedRate)

  const commercialEstimate: CommercialEstimate = {
    blended_rate_used: blendedRate,
    total_cost_pre_ai: costPreAI,
    total_cost_post_ai_min: costPostAIMin,
    total_cost_post_ai_expected: costPostAIExpected,
    total_cost_post_ai_max: costPostAIMax,
    revenue_proposed: revenue,
    margin_pre_ai: revenue ? Math.round(((revenue - costPreAI) / revenue) * 1000) / 10 : null,
    margin_post_ai_expected: revenue ? Math.round(((revenue - costPostAIExpected) / revenue) * 1000) / 10 : null,
    margin_post_ai_max: revenue ? Math.round(((revenue - costPostAIMax) / revenue) * 1000) / 10 : null,
  }

  // 4. Glidepath
  const glidepath = calculateGlidepath(annualPreAIHours, aiCompression, blendedRate, fteHours)

  // 5. Sensitivity drivers
  const sensitivityDrivers: SensitivityDriver[] = [
    {
      driver: 'Volume Change (±20%)',
      current_value: input.work_categories.reduce((s, c) => s + c.volume, 0),
      impact_description: `±20% volume shifts total cost by ~${formatCurrency(costPostAIExpected * 0.2, input.currency)}`,
      impact_magnitude: 'high',
      direction: 'bidirectional',
    },
    {
      driver: 'AI Compression Variance',
      current_value: `${aiCompression.expected_percent}%`,
      impact_description: `Range of ${aiCompression.min_percent}% to ${aiCompression.max_percent}% creates cost spread of ${formatCurrency(Math.abs(costPostAIMin - costPostAIMax), input.currency)}`,
      impact_magnitude: 'high',
      direction: 'bidirectional',
    },
    {
      driver: 'Blended Rate (±10%)',
      current_value: `${input.currency} ${blendedRate}`,
      impact_description: `±10% rate change shifts cost by ~${formatCurrency(costPostAIExpected * 0.1, input.currency)}`,
      impact_magnitude: 'high',
      direction: 'bidirectional',
    },
    {
      driver: 'AHT Productivity (±15%)',
      current_value: 'Varies by category',
      impact_description: `AHT variance directly scales effort linearly; ±15% shifts ~${formatCurrency(costPostAIExpected * 0.15, input.currency)}`,
      impact_magnitude: 'medium',
      direction: 'bidirectional',
    },
    {
      driver: 'SLA Coverage Expansion',
      current_value: `${input.sla_coverage_hours}h/day`,
      impact_description: 'Moving to 24×7 could require additional shift coverage (1.5-2x staffing for overlap)',
      impact_magnitude: 'medium',
      direction: 'cost_increase',
    },
  ]

  // 6. Confidence
  const confidence = determineConfidence(input)

  // 7. Assumptions
  const assumptions = collectAssumptions(input)

  return {
    scenario_type: input.scenario_type,
    confidence_level: confidence,
    deal_name: input.deal_name || 'Untitled Deal',
    client_name: input.client_name || 'Unknown Client',
    assumptions,
    scope_summary: {
      total_categories: input.work_categories.length,
      total_volume: input.work_categories.reduce((s, c) => s + c.volume, 0),
      coverage_hours: input.sla_coverage_hours,
      contract_months: input.contract_term_months,
    },
    effort_estimate: effortEstimate,
    ai_compression: aiCompression,
    commercial_estimate: commercialEstimate,
    glidepath_3_year: glidepath,
    sensitivity_drivers: sensitivityDrivers,
    generated_at: new Date().toISOString(),
  }
}

function determineConfidence(input: DealInput): ConfidenceLevel {
  let score = 0
  if (input.work_categories.length > 0) score += 2
  if (input.work_categories.every(c => c.volume > 0)) score += 2
  if (input.work_categories.every(c => c.aht_hours > 0)) score += 2
  if (input.blended_rate) score += 1
  if (input.deal_name) score += 1
  if (input.work_categories.length >= 3) score += 1
  if (input.revenue_proposed) score += 1

  if (score >= 8) return 'High'
  if (score >= 5) return 'Medium'
  return 'Low'
}

function formatCurrency(amount: number, currency: string): string {
  return `${currency} ${Math.abs(Math.round(amount)).toLocaleString()}`
}
