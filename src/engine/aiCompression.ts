// =========================================
// AI Compression Engine
// =========================================

import { WorkCategory, AICompression } from '../types/deal'
import { CATEGORY_AI_COMPRESSION } from './benchmarks'

function normalizeCategory(name: string): string {
  const lower = name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_')

  const mappings: Record<string, string[]> = {
    incident_management: ['incident', 'l1', 'l2', 'l3', 'ticket', 'break_fix', 'breakfix'],
    service_request: ['service_request', 'request', 'fulfillment', 'provisioning', 'catalog'],
    monitoring_alerting: ['monitor', 'alert', 'observ', 'noc', 'aiops', 'event'],
    change_management: ['change', 'cab', 'rfc'],
    problem_management: ['problem', 'root_cause', 'rca'],
    reporting_analytics: ['report', 'dashboard', 'analytic', 'metric', 'kpi'],
    patch_management: ['patch', 'update', 'vulnerab'],
    backup_recovery: ['backup', 'recovery', 'dr', 'disaster'],
    requirements_analysis: ['requirement', 'brd', 'spec', 'discovery'],
    design_architecture: ['design', 'architect', 'solution_design', 'hld', 'lld'],
    development_coding: ['develop', 'coding', 'code', 'build', 'implement', 'sprint', 'feature'],
    testing_qa: ['test', 'qa', 'quality', 'regression', 'uat'],
    deployment_devops: ['deploy', 'devops', 'ci_cd', 'pipeline', 'release'],
    documentation: ['document', 'runbook', 'knowledge', 'wiki'],
    training: ['train', 'enablement', 'onboard'],
    project_management: ['project_manage', 'pm', 'governance', 'pmo'],
  }

  for (const [key, patterns] of Object.entries(mappings)) {
    if (patterns.some(p => lower.includes(p))) {
      return key
    }
  }

  return 'default'
}

export function calculateAICompression(categories: WorkCategory[]): AICompression {
  const byCategory = categories.map(cat => {
    const normalized = normalizeCategory(cat.name)
    const benchmark = CATEGORY_AI_COMPRESSION[normalized] || CATEGORY_AI_COMPRESSION['default']

    // Complexity affects compression: high complexity = less compressible
    const complexityFactor = cat.complexity === 'high' ? 0.7 :
                             cat.complexity === 'low' ? 1.2 : 1.0

    return {
      category_id: cat.id,
      category_name: cat.name,
      min_percent: Math.round(benchmark.min * complexityFactor * 10) / 10,
      expected_percent: Math.round(benchmark.expected * complexityFactor * 10) / 10,
      max_percent: Math.round(benchmark.max * complexityFactor * 10) / 10,
      rationale: benchmark.rationale,
    }
  })

  // Weighted average by volume for overall compression
  const totalVolume = categories.reduce((sum, c) => sum + c.volume, 0) || 1
  const weightedMin = byCategory.reduce((sum, c, i) =>
    sum + c.min_percent * (categories[i].volume / totalVolume), 0)
  const weightedExp = byCategory.reduce((sum, c, i) =>
    sum + c.expected_percent * (categories[i].volume / totalVolume), 0)
  const weightedMax = byCategory.reduce((sum, c, i) =>
    sum + c.max_percent * (categories[i].volume / totalVolume), 0)

  return {
    min_percent: Math.round(weightedMin * 10) / 10,
    expected_percent: Math.round(weightedExp * 10) / 10,
    max_percent: Math.round(weightedMax * 10) / 10,
    by_category: byCategory,
  }
}
