// =========================================
// Industry Benchmarks
// =========================================

import { ScenarioType } from '../types/deal'

export interface ComplexityMultiplier {
  low: number
  medium: number
  high: number
}

export const COMPLEXITY_MULTIPLIERS: ComplexityMultiplier = {
  low: 0.7,
  medium: 1.0,
  high: 1.5,
}

export const DEFAULT_BLENDED_RATES: Record<string, number> = {
  USD: 65,
  EUR: 58,
  GBP: 52,
  INR: 18,
  AUD: 72,
}

export const DEFAULT_FTE_ANNUAL_HOURS = 1920 // 40hrs/week × 48 productive weeks

export const AI_COMPRESSION_BENCHMARKS: Record<ScenarioType, {
  min: number
  expected: number
  max: number
}> = {
  managed_services: { min: 8, expected: 18, max: 30 },
  greenfield_implementation: { min: 5, expected: 12, max: 22 },
  product_feature_development: { min: 10, expected: 20, max: 35 },
  tm_capacity: { min: 5, expected: 15, max: 25 },
  hybrid: { min: 7, expected: 16, max: 28 },
}

export const CATEGORY_AI_COMPRESSION: Record<string, {
  min: number
  expected: number
  max: number
  rationale: string
}> = {
  // Managed Services categories
  'incident_management': { min: 15, expected: 25, max: 40, rationale: 'L1/L2 ticket triage, auto-resolution, knowledge-base matching' },
  'service_request': { min: 10, expected: 20, max: 35, rationale: 'Templated fulfillment, auto-provisioning, chatbot deflection' },
  'monitoring_alerting': { min: 20, expected: 35, max: 50, rationale: 'AIOps noise reduction, predictive alerting, auto-remediation' },
  'change_management': { min: 3, expected: 8, max: 15, rationale: 'CAB prep automation, impact analysis assist; human approval required' },
  'problem_management': { min: 5, expected: 10, max: 18, rationale: 'Root cause pattern analysis assist; largely human-driven' },
  'reporting_analytics': { min: 15, expected: 30, max: 45, rationale: 'Auto-generated dashboards, NLP summaries, anomaly detection' },
  'patch_management': { min: 10, expected: 20, max: 30, rationale: 'Automated scanning, scheduling, compliance checks' },
  'backup_recovery': { min: 8, expected: 15, max: 25, rationale: 'Automated verification, predictive failure detection' },

  // Implementation categories
  'requirements_analysis': { min: 5, expected: 12, max: 20, rationale: 'AI-assisted requirement extraction from documents' },
  'design_architecture': { min: 3, expected: 8, max: 15, rationale: 'Reference architecture suggestions; human judgment dominant' },
  'development_coding': { min: 12, expected: 22, max: 38, rationale: 'Code generation, copilot assist, boilerplate automation' },
  'testing_qa': { min: 15, expected: 28, max: 42, rationale: 'Test case generation, automated regression, visual testing' },
  'deployment_devops': { min: 10, expected: 18, max: 28, rationale: 'Pipeline automation, IaC generation, config management' },
  'documentation': { min: 20, expected: 35, max: 50, rationale: 'Auto-generation of technical docs, runbooks, API docs' },
  'training': { min: 5, expected: 12, max: 20, rationale: 'AI-generated training materials; delivery remains human' },
  'project_management': { min: 3, expected: 8, max: 12, rationale: 'Status report generation, risk flagging; coordination is human' },

  // Default fallback
  'default': { min: 5, expected: 15, max: 25, rationale: 'General benchmark applied; no specific category match' },
}

export const VOLUME_UNITS = [
  'tickets/month',
  'requests/month',
  'alerts/month',
  'features',
  'story_points',
  'modules',
  'endpoints',
  'users',
  'environments',
  'servers',
  'applications',
  'releases/month',
]

export const ROLE_OPTIONS = [
  // General engineering
  'Analyst',
  'Engineer',
  'Senior Engineer',
  'Lead Engineer',
  'Architect',
  'Solution Architect',
  // AI / Data
  'Data Scientist',
  'Senior Data Scientist',
  'ML Engineer',
  'Data Engineer',
  'AI/ML Researcher',
  // Quality & Testing
  'QA Engineer',
  'Test Lead',
  // Operations
  'DevOps Engineer',
  'Platform Engineer',
  'Site Reliability Engineer',
  'Network Engineer',
  'DBA',
  'Security Analyst',
  // Domain / Clinical
  'Clinical Informatics Specialist',
  'Business Analyst',
  // Management
  'Project Manager',
  'Delivery Manager',
  'Scrum Master',
  'Support Lead',
  // Other
  'Technical Writer',
  'UX Designer',
]

export const GLIDEPATH_RAMP: Record<string, { y1: number; y2: number; y3: number }> = {
  conservative: { y1: 0.6, y2: 0.8, y3: 1.0 },
  expected: { y1: 0.7, y2: 0.9, y3: 1.0 },
  aggressive: { y1: 0.85, y2: 0.95, y3: 1.0 },
}
