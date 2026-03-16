// =========================================
// DealBrkr Type System
// =========================================

export type ScenarioType =
  | 'managed_services'
  | 'greenfield_implementation'
  | 'product_feature_development'
  | 'tm_capacity'
  | 'hybrid'

export type SourceType = 'user' | 'inferred'
export type ImpactLevel = 'low' | 'medium' | 'high'
export type ConfidenceLevel = 'High' | 'Medium' | 'Low'
export type InputMode = 'structured' | 'rfp_paste'

// ---------- Assumptions ----------
export interface Assumption {
  assumption_name: string
  value: string | number
  source: SourceType
  impact_level: ImpactLevel
}

// ---------- Work Category ----------
export interface WorkCategory {
  id: string
  name: string
  volume: number
  volume_unit: string
  aht_hours: number
  complexity: 'low' | 'medium' | 'high'
  roles: RoleAllocation[]
  sla_coverage_hours?: number
  notes?: string
}

export interface RoleAllocation {
  role: string
  percentage: number
}

// ---------- Deal Input ----------
export interface DealInput {
  scenario_type: ScenarioType
  input_mode: InputMode
  raw_rfp_text?: string
  deal_name: string
  client_name: string
  work_categories: WorkCategory[]
  blended_rate?: number
  revenue_proposed?: number
  // managed_services / tm_capacity / hybrid use contract_term_months
  contract_term_months: number
  // greenfield_implementation / product_feature_development use project_duration_weeks
  project_duration_weeks: number
  sla_coverage_hours: number
  fte_annual_hours: number
  currency: string
}

// ---------- Effort Estimate ----------
export interface EffortEstimate {
  pre_ai_hours: number
  post_ai_hours_min: number
  post_ai_hours_expected: number
  post_ai_hours_max: number
  fte_equivalent_pre_ai: number
  fte_equivalent_post_ai_min: number
  fte_equivalent_post_ai_expected: number
  fte_equivalent_post_ai_max: number
  breakdown_by_category: CategoryEffort[]
}

export interface CategoryEffort {
  category_id: string
  category_name: string
  pre_ai_hours: number
  post_ai_hours_expected: number
  ai_compression_min: number
  ai_compression_expected: number
  ai_compression_max: number
  roles: { role: string; hours: number }[]
}

// ---------- AI Compression ----------
export interface AICompression {
  min_percent: number
  expected_percent: number
  max_percent: number
  by_category: {
    category_id: string
    category_name: string
    min_percent: number
    expected_percent: number
    max_percent: number
    rationale: string
  }[]
}

// ---------- Commercial Estimate ----------
export interface CommercialEstimate {
  blended_rate_used: number
  total_cost_pre_ai: number
  total_cost_post_ai_min: number
  total_cost_post_ai_expected: number
  total_cost_post_ai_max: number
  revenue_proposed: number | null
  margin_pre_ai: number | null
  margin_post_ai_expected: number | null
  margin_post_ai_max: number | null
}

// ---------- Glidepath ----------
export interface GlidepathYear {
  year: number
  conservative_cost: number
  expected_cost: number
  aggressive_cost: number
  conservative_fte: number
  expected_fte: number
  aggressive_fte: number
  conservative_compression: number
  expected_compression: number
  aggressive_compression: number
}

export interface Glidepath3Year {
  years: GlidepathYear[]
}

// ---------- Sensitivity ----------
export interface SensitivityDriver {
  driver: string
  current_value: string | number
  impact_description: string
  impact_magnitude: ImpactLevel
  direction: 'cost_increase' | 'cost_decrease' | 'bidirectional'
}

// ---------- Full Output ----------
export interface DealOutput {
  scenario_type: ScenarioType
  confidence_level: ConfidenceLevel
  deal_name: string
  client_name: string
  assumptions: Assumption[]
  scope_summary: {
    total_categories: number
    total_volume: number
    coverage_hours: number
    contract_months: number
  }
  effort_estimate: EffortEstimate
  ai_compression: AICompression
  commercial_estimate: CommercialEstimate
  glidepath_3_year: Glidepath3Year
  sensitivity_drivers: SensitivityDriver[]
  generated_at: string
}

// ---------- Default Factory ----------
export function createDefaultDealInput(): DealInput {
  return {
    scenario_type: 'managed_services',
    input_mode: 'structured',
    deal_name: '',
    client_name: '',
    work_categories: [],
    blended_rate: undefined,
    revenue_proposed: undefined,
    contract_term_months: 36,
    project_duration_weeks: 26,
    sla_coverage_hours: 12,
    fte_annual_hours: 1920,
    currency: 'USD',
  }
}

// Scenarios where work is project-based (fixed scope, not monthly recurring)
export const PROJECT_BASED_SCENARIOS: ScenarioType[] = [
  'greenfield_implementation',
  'product_feature_development',
]

export function isProjectBased(scenario: ScenarioType): boolean {
  return PROJECT_BASED_SCENARIOS.includes(scenario)
}

export function createDefaultWorkCategory(): WorkCategory {
  return {
    id: crypto.randomUUID(),
    name: '',
    volume: 0,
    volume_unit: 'tickets/month',
    aht_hours: 1,
    complexity: 'medium',
    roles: [{ role: 'Analyst', percentage: 100 }],
  }
}
