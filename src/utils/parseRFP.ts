// =========================================
// RFP Text Parser — section-aware, domain-aware
// =========================================

import { WorkCategory, ScenarioType, RoleAllocation, createDefaultWorkCategory } from '../types/deal'

interface ParsedRFP {
  scenario_type: ScenarioType
  deal_name: string
  categories: WorkCategory[]
  blended_rate?: number
  revenue?: number
  contract_months: number
  project_duration_weeks: number
}

// ---- Role templates per work type -----------------------------------------

const ROLES: Record<string, RoleAllocation[]> = {
  requirements:       [{ role: 'Business Analyst', percentage: 60 }, { role: 'Project Manager', percentage: 25 }, { role: 'Architect', percentage: 15 }],
  architecture:       [{ role: 'Solution Architect', percentage: 60 }, { role: 'Senior Engineer', percentage: 30 }, { role: 'Business Analyst', percentage: 10 }],
  development:        [{ role: 'Engineer', percentage: 50 }, { role: 'Senior Engineer', percentage: 30 }, { role: 'QA Engineer', percentage: 20 }],
  ml_development:     [{ role: 'Data Scientist', percentage: 45 }, { role: 'ML Engineer', percentage: 35 }, { role: 'Data Engineer', percentage: 20 }],
  data_engineering:   [{ role: 'Data Engineer', percentage: 65 }, { role: 'DBA', percentage: 20 }, { role: 'Analyst', percentage: 15 }],
  integration:        [{ role: 'Engineer', percentage: 55 }, { role: 'Architect', percentage: 25 }, { role: 'QA Engineer', percentage: 20 }],
  testing:            [{ role: 'QA Engineer', percentage: 70 }, { role: 'Engineer', percentage: 20 }, { role: 'Analyst', percentage: 10 }],
  clinical_validation:[{ role: 'Clinical Informatics Specialist', percentage: 50 }, { role: 'Business Analyst', percentage: 30 }, { role: 'QA Engineer', percentage: 20 }],
  deployment:         [{ role: 'DevOps Engineer', percentage: 60 }, { role: 'Engineer', percentage: 25 }, { role: 'Solution Architect', percentage: 15 }],
  security:           [{ role: 'Security Analyst', percentage: 65 }, { role: 'Architect', percentage: 20 }, { role: 'Engineer', percentage: 15 }],
  documentation:      [{ role: 'Technical Writer', percentage: 55 }, { role: 'Business Analyst', percentage: 30 }, { role: 'Engineer', percentage: 15 }],
  training:           [{ role: 'Business Analyst', percentage: 50 }, { role: 'Technical Writer', percentage: 30 }, { role: 'Project Manager', percentage: 20 }],
  project_management: [{ role: 'Delivery Manager', percentage: 50 }, { role: 'Project Manager', percentage: 35 }, { role: 'Scrum Master', percentage: 15 }],
  ui_ux:              [{ role: 'UX Designer', percentage: 50 }, { role: 'Engineer', percentage: 40 }, { role: 'Business Analyst', percentage: 10 }],
  infrastructure:     [{ role: 'Platform Engineer', percentage: 55 }, { role: 'DevOps Engineer', percentage: 30 }, { role: 'Architect', percentage: 15 }],
  // Managed services
  incident_mgmt:      [{ role: 'Analyst', percentage: 50 }, { role: 'Engineer', percentage: 30 }, { role: 'Support Lead', percentage: 20 }],
  monitoring:         [{ role: 'Site Reliability Engineer', percentage: 55 }, { role: 'Analyst', percentage: 30 }, { role: 'Engineer', percentage: 15 }],
  service_request:    [{ role: 'Analyst', percentage: 60 }, { role: 'Engineer', percentage: 30 }, { role: 'Support Lead', percentage: 10 }],
  change_mgmt:        [{ role: 'Analyst', percentage: 40 }, { role: 'Engineer', percentage: 40 }, { role: 'Delivery Manager', percentage: 20 }],
}

// ---- Keyword → category map ------------------------------------------------

interface CategoryDef {
  name: string
  roleKey: string
  ahtHours: number   // hours per unit for project-based, hours per ticket/month for ops
  keywords: string[]
  unit: string
}

const PROJECT_CATEGORY_DEFS: CategoryDef[] = [
  {
    name: 'Requirements & Business Analysis',
    roleKey: 'requirements',
    ahtHours: 120,
    unit: 'deliverables',
    keywords: ['requirement', 'business analysis', 'user stor', 'use case', 'discovery', 'workshop', 'stakeholder interview', 'brd', 'frd', 'functional spec'],
  },
  {
    name: 'Architecture & Technical Design',
    roleKey: 'architecture',
    ahtHours: 80,
    unit: 'deliverables',
    keywords: ['architect', 'technical design', 'system design', 'hld', 'lld', 'design document', 'solution design', 'design spec'],
  },
  {
    name: 'AI / ML Model Development',
    roleKey: 'ml_development',
    ahtHours: 200,
    unit: 'models',
    keywords: ['machine learning', 'deep learning', 'neural network', 'ai model', 'model train', 'algorithm develop', 'model develop', 'predictive model', 'computer vision', 'nlp', 'natural language', 'classification', 'segmentation', 'detection model', 'inference', 'model pipeline', 'biopsy', 'pathology ai', 'image analysis'],
  },
  {
    name: 'Data Engineering & Pipelines',
    roleKey: 'data_engineering',
    ahtHours: 120,
    unit: 'pipelines',
    keywords: ['data pipeline', 'etl', 'data ingestion', 'data lake', 'data warehouse', 'data prep', 'data annotation', 'dataset', 'data curation', 'data collection', 'training data', 'data platform', 'data infrastructure'],
  },
  {
    name: 'Application Development',
    roleKey: 'development',
    ahtHours: 40,
    unit: 'features',
    keywords: ['develop', 'implement', 'build', 'code', 'software develop', 'web app', 'mobile app', 'application build', 'frontend', 'backend', 'full-stack', 'microservice', 'api develop', 'portal'],
  },
  {
    name: 'System Integration',
    roleKey: 'integration',
    ahtHours: 80,
    unit: 'integrations',
    keywords: ['integrat', 'hl7', 'fhir', 'pacs', 'ehr', 'his', 'lis', 'middleware', 'api integrat', 'connector', 'interoperab', 'interface develop', 'system connect'],
  },
  {
    name: 'UI / UX Development',
    roleKey: 'ui_ux',
    ahtHours: 60,
    unit: 'screens',
    keywords: ['user interface', 'ui/ux', 'dashboard', 'front end', 'frontend', 'wireframe', 'mockup', 'prototype', 'visualiz', 'reporting ui', 'clinician interface', 'viewer'],
  },
  {
    name: 'Testing & Quality Assurance',
    roleKey: 'testing',
    ahtHours: 80,
    unit: 'test cycles',
    keywords: ['test', 'qa', 'quality assurance', 'uat', 'acceptance test', 'regression', 'unit test', 'integration test', 'performance test', 'load test', 'pen test', 'verification', 'validation'],
  },
  {
    name: 'Clinical Validation & Regulatory',
    roleKey: 'clinical_validation',
    ahtHours: 160,
    unit: 'validation rounds',
    keywords: ['clinical valid', 'clinical trial', 'fda', 'ce mark', 'iso 13485', 'iec 62304', 'regulatory', 'hipaa', 'audit trail', 'compliance', 'gdpr', 'clinical study', 'irb', 'clinical evaluation'],
  },
  {
    name: 'Infrastructure & DevOps',
    roleKey: 'deployment',
    ahtHours: 80,
    unit: 'environments',
    keywords: ['devops', 'cicd', 'ci/cd', 'cloud infra', 'aws', 'azure', 'gcp', 'kubernetes', 'docker', 'terraform', 'infrastructure', 'deployment pipeline', 'iac', 'environment setup'],
  },
  {
    name: 'Security & Compliance',
    roleKey: 'security',
    ahtHours: 60,
    unit: 'workstreams',
    keywords: ['security', 'penetration test', 'vulnerability', 'soc 2', 'iso 27001', 'encryption', 'access control', 'identity', 'rbac', 'siem'],
  },
  {
    name: 'Documentation',
    roleKey: 'documentation',
    ahtHours: 40,
    unit: 'documents',
    keywords: ['documentat', 'user manual', 'runbook', 'technical doc', 'api doc', 'knowledge base', 'wiki', 'spec doc', 'design doc'],
  },
  {
    name: 'Training & Knowledge Transfer',
    roleKey: 'training',
    ahtHours: 40,
    unit: 'sessions',
    keywords: ['training', 'knowledge transfer', 'workshop', 'onboarding', 'user training', 'staff training', 'go-live support', 'hypercare'],
  },
  {
    name: 'Project Management & Governance',
    roleKey: 'project_management',
    ahtHours: 0,  // calculated as % of total
    unit: 'months',
    keywords: ['project manag', 'programme manag', 'governance', 'steering', 'status report', 'risk manag', 'change manag', 'agile', 'scrum'],
  },
]

const OPS_CATEGORY_DEFS: CategoryDef[] = [
  {
    name: 'Incident Management',
    roleKey: 'incident_mgmt',
    ahtHours: 1.0,
    unit: 'tickets/month',
    keywords: ['incident', 'ticket', 'issue', 'problem', 'outage', 'break-fix'],
  },
  {
    name: 'Service Requests',
    roleKey: 'service_request',
    ahtHours: 0.75,
    unit: 'requests/month',
    keywords: ['service request', 'fulfilment', 'provisioning', 'access request', 'sr'],
  },
  {
    name: 'Monitoring & Alerting',
    roleKey: 'monitoring',
    ahtHours: 0.25,
    unit: 'alerts/month',
    keywords: ['monitor', 'alert', 'observabilit', 'uptime', 'sla breach', 'event manag'],
  },
  {
    name: 'Change Management',
    roleKey: 'change_mgmt',
    ahtHours: 2.0,
    unit: 'changes/month',
    keywords: ['change manag', 'change request', 'release manag', 'deploy request', 'cab'],
  },
  {
    name: 'Reporting & Analytics',
    roleKey: 'project_management',
    ahtHours: 4.0,
    unit: 'reports/month',
    keywords: ['report', 'dashboard', 'analytics', 'kpi', 'metric', 'sla report'],
  },
  {
    name: 'Patch & Vulnerability Management',
    roleKey: 'infrastructure',
    ahtHours: 0.5,
    unit: 'assets/month',
    keywords: ['patch', 'vulnerab', 'security update', 'compliance scan', 'hardening'],
  },
]

// ---- Main parser -----------------------------------------------------------

export function parseRFPText(text: string): ParsedRFP {
  const lower = text.toLowerCase()

  // 1. Detect scenario type
  const scenario_type = detectScenario(lower)
  const projectBased = scenario_type === 'greenfield_implementation' || scenario_type === 'product_feature_development'

  // 2. Extract categories
  const categories = projectBased
    ? extractProjectCategories(text, lower)
    : extractOpsCategories(text, lower)

  // 3. Temporal parameters
  const project_duration_weeks = extractProjectDurationWeeks(text)
  const contract_months = extractContractMonths(text)

  // 4. Commercial
  const blended_rate = extractRate(text)
  const revenue = extractRevenue(text)

  // 5. Ensure PM is included for project-based if >= 3 categories
  if (projectBased && categories.length >= 3) {
    const hasPM = categories.some(c => c.name.toLowerCase().includes('project manag'))
    if (!hasPM) {
      // Add PM as ~10% of total hours
      const totalHours = categories.reduce((s, c) => s + c.volume * c.aht_hours, 0)
      const pmHours = Math.round(totalHours * 0.1)
      if (pmHours > 0) {
        const pm = createDefaultWorkCategory()
        pm.name = 'Project Management & Governance'
        pm.volume = Math.round(project_duration_weeks / 4) || 6
        pm.volume_unit = 'months'
        pm.aht_hours = Math.max(40, Math.round(pmHours / (project_duration_weeks / 4 || 6)))
        pm.complexity = 'medium'
        pm.roles = ROLES['project_management']
        categories.push(pm)
      }
    }
  }

  return {
    scenario_type,
    deal_name: extractDealName(text),
    categories,
    blended_rate,
    revenue,
    contract_months,
    project_duration_weeks,
  }
}

// ---- Scenario detection ----------------------------------------------------

function detectScenario(lower: string): ScenarioType {
  const scores: Record<ScenarioType, number> = {
    managed_services: 0,
    greenfield_implementation: 0,
    product_feature_development: 0,
    tm_capacity: 0,
    hybrid: 0,
  }

  // Managed services signals
  const msSignals = ['managed service', 'ongoing support', 'service desk', 'helpdesk', 'sla', 'uptime', 'break-fix', 'incident manag', 'operations', 'run-and-maintain', 'steady state', 'monthly ticket', 'per month']
  msSignals.forEach(s => { if (lower.includes(s)) scores.managed_services += 2 })

  // Greenfield / implementation signals
  const gfSignals = ['greenfield', 'new build', 'implement', 'develop a', 'build a', 'from scratch', 'new system', 'new platform', 'new solution', 'new application', 'digital transform', 'project deliver', 'phase 1', 'phase 2', 'go-live', 'milestone']
  gfSignals.forEach(s => { if (lower.includes(s)) scores.greenfield_implementation += 2 })
  // AI/ML projects are almost always greenfield
  const aiSignals = ['machine learning', 'deep learning', 'ai model', 'neural network', 'model train', 'computer vision', 'nlp', 'biopsy', 'radiology ai', 'pathology ai', 'data science project', 'rfp for ai']
  aiSignals.forEach(s => { if (lower.includes(s)) scores.greenfield_implementation += 3 })

  // Product/feature signals
  const pfSignals = ['sprint', 'backlog', 'user story', 'epics', 'feature develop', 'product roadmap', 'mvp', 'agile delivery', 'scrum team', 'kanban', 'release cycle']
  pfSignals.forEach(s => { if (lower.includes(s)) scores.product_feature_development += 2 })

  // T&M signals
  const tmSignals = ['time and material', 't&m', 'time & material', 'staff augment', 'body shop', 'resource augment', 'capacity model', 'rate card', 'per diem']
  tmSignals.forEach(s => { if (lower.includes(s)) scores.tm_capacity += 3 })

  // Hybrid signals
  if (lower.includes('hybrid') && (scores.managed_services > 0 || scores.greenfield_implementation > 0)) {
    scores.hybrid += 2
  }

  // Return highest score
  const winner = (Object.entries(scores) as [ScenarioType, number][]).reduce(
    (best, [k, v]) => v > best[1] ? [k, v] : best,
    ['managed_services', 0] as [ScenarioType, number]
  )
  return winner[0]
}

// ---- Project-based category extraction ------------------------------------

function extractProjectCategories(text: string, lower: string): WorkCategory[] {
  const found: WorkCategory[] = []
  const seen = new Set<string>()

  // Try to extract duration for AHT calculations
  const durationWeeks = extractProjectDurationWeeks(text)

  for (const def of PROJECT_CATEGORY_DEFS) {
    if (seen.has(def.name)) continue

    // Check keyword presence
    const hitCount = def.keywords.filter(kw => lower.includes(kw)).length
    if (hitCount === 0) continue

    seen.add(def.name)
    const cat = createDefaultWorkCategory()
    cat.name = def.name
    cat.roles = ROLES[def.roleKey] ?? [{ role: 'Engineer', percentage: 100 }]

    // Try to extract explicit numbers for this category
    const extractedVolume = extractVolumeNearKeyword(text, lower, def.keywords)

    if (def.roleKey === 'project_management') {
      // PM is calculated as a fraction of project months
      cat.volume = Math.max(1, Math.round(durationWeeks / 4))
      cat.volume_unit = 'months'
      cat.aht_hours = 80  // ~2 weeks PM effort per month
      cat.complexity = 'medium'
    } else if (extractedVolume) {
      cat.volume = extractedVolume
      cat.volume_unit = def.unit
      cat.aht_hours = def.ahtHours
      cat.complexity = 'medium'
    } else {
      // Default sensible volumes based on hit strength
      cat.volume = hitCount >= 3 ? 3 : hitCount >= 2 ? 2 : 1
      cat.volume_unit = def.unit
      cat.aht_hours = def.ahtHours
      cat.complexity = hitCount >= 3 ? 'high' : 'medium'
    }

    found.push(cat)
  }

  // If nothing found, produce smart defaults based on detected AI/tech signals
  if (found.length === 0) {
    return buildDefaultProjectCategories(lower, durationWeeks)
  }

  return found
}

// ---- Ops/managed-services category extraction -----------------------------

function extractOpsCategories(text: string, lower: string): WorkCategory[] {
  const found: WorkCategory[] = []
  const seen = new Set<string>()

  // Volume patterns: look for "X tickets/month" etc.
  const volumePatterns = [
    /(\d[\d,]*)\s*(tickets?|incidents?|requests?|alerts?|issues?|changes?|events?)\s*(?:per|\/)\s*(month|week|day)/gi,
    /(\d[\d,]*)\s*(?:monthly|per month)\s*(tickets?|incidents?|requests?|alerts?|events?)/gi,
    /(?:volume|expected|approximately|~|around)\s*(\d[\d,]*)\s*(tickets?|incidents?|requests?|alerts?|events?)/gi,
  ]

  for (const pattern of volumePatterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const volume = parseInt(match[1].replace(/,/g, ''))
      const unitRaw = match[2].toLowerCase().replace(/s$/, '')
      const def = OPS_CATEGORY_DEFS.find(d => d.keywords.some(k => unitRaw.includes(k.replace(/s$/, ''))))
      if (!def || seen.has(def.name)) continue
      seen.add(def.name)
      const cat = createDefaultWorkCategory()
      cat.name = def.name
      cat.volume = volume
      cat.volume_unit = def.unit
      cat.aht_hours = def.ahtHours
      cat.complexity = volume > 5000 ? 'high' : volume > 1000 ? 'medium' : 'low'
      cat.roles = ROLES[def.roleKey]
      found.push(cat)
    }
  }

  // Also scan for ops category keywords without explicit volumes
  for (const def of OPS_CATEGORY_DEFS) {
    if (seen.has(def.name)) continue
    const hitCount = def.keywords.filter(kw => lower.includes(kw)).length
    if (hitCount < 2) continue  // require at least 2 keyword hits for ops
    seen.add(def.name)
    const cat = createDefaultWorkCategory()
    cat.name = def.name
    cat.volume = 500  // default placeholder volume
    cat.volume_unit = def.unit
    cat.aht_hours = def.ahtHours
    cat.complexity = 'medium'
    cat.roles = ROLES[def.roleKey]
    found.push(cat)
  }

  if (found.length === 0) {
    const cat = createDefaultWorkCategory()
    cat.name = 'Managed Operations'
    cat.volume = 500
    cat.volume_unit = 'tickets/month'
    cat.aht_hours = 1.0
    cat.complexity = 'medium'
    cat.roles = ROLES['incident_mgmt']
    found.push(cat)
  }

  return found
}

// ---- Smart defaults for unknown project RFPs ------------------------------

function buildDefaultProjectCategories(lower: string, durationWeeks: number): WorkCategory[] {
  const cats: WorkCategory[] = []

  // Detect if it's an AI/ML project
  const isAI = ['ai', 'ml', 'machine learning', 'model', 'algorithm', 'data science', 'neural', 'vision', 'nlp', 'biopsy', 'pathology', 'radiology', 'imaging'].some(k => lower.includes(k))
  const isHealthcare = ['health', 'clinical', 'patient', 'hospital', 'ehr', 'pacs', 'fhir', 'hipaa', 'medical', 'biopsy', 'pathology', 'radiology'].some(k => lower.includes(k))

  if (isAI) {
    cats.push(makeProjectCat('Requirements & Business Analysis', 'requirements', 1, 'deliverables', 120, 'medium'))
    cats.push(makeProjectCat('Data Engineering & Pipelines', 'data_engineering', 2, 'pipelines', 120, 'high'))
    cats.push(makeProjectCat('AI / ML Model Development', 'ml_development', 2, 'models', 200, 'high'))
    cats.push(makeProjectCat('System Integration', 'integration', 2, 'integrations', 80, 'medium'))
    cats.push(makeProjectCat('Testing & Quality Assurance', 'testing', 2, 'test cycles', 80, 'medium'))
    if (isHealthcare) {
      cats.push(makeProjectCat('Clinical Validation & Regulatory', 'clinical_validation', 2, 'validation rounds', 160, 'high'))
    }
    cats.push(makeProjectCat('Infrastructure & DevOps', 'deployment', 1, 'environments', 80, 'medium'))
    cats.push(makeProjectCat('Training & Knowledge Transfer', 'training', 3, 'sessions', 40, 'low'))
  } else {
    // Generic implementation project
    cats.push(makeProjectCat('Requirements & Business Analysis', 'requirements', 1, 'deliverables', 120, 'medium'))
    cats.push(makeProjectCat('Architecture & Technical Design', 'architecture', 1, 'deliverables', 80, 'medium'))
    cats.push(makeProjectCat('Application Development', 'development', 5, 'features', 40, 'medium'))
    cats.push(makeProjectCat('Testing & Quality Assurance', 'testing', 2, 'test cycles', 80, 'medium'))
    cats.push(makeProjectCat('Infrastructure & DevOps', 'deployment', 1, 'environments', 80, 'medium'))
    cats.push(makeProjectCat('Training & Knowledge Transfer', 'training', 2, 'sessions', 40, 'low'))
  }

  // Add PM
  cats.push(makeProjectCat(
    'Project Management & Governance',
    'project_management',
    Math.max(1, Math.round(durationWeeks / 4)),
    'months',
    80,
    'medium'
  ))

  return cats
}

function makeProjectCat(
  name: string, roleKey: string,
  volume: number, unit: string,
  aht: number, complexity: 'low' | 'medium' | 'high'
): WorkCategory {
  const cat = createDefaultWorkCategory()
  cat.name = name
  cat.volume = volume
  cat.volume_unit = unit
  cat.aht_hours = aht
  cat.complexity = complexity
  cat.roles = ROLES[roleKey] ?? [{ role: 'Engineer', percentage: 100 }]
  return cat
}

// ---- Volume extraction near keywords --------------------------------------

function extractVolumeNearKeyword(text: string, lower: string, keywords: string[]): number | null {
  for (const kw of keywords) {
    const idx = lower.indexOf(kw)
    if (idx === -1) continue
    // Look within 100 chars around the keyword for a number
    const window = text.slice(Math.max(0, idx - 60), idx + 100)
    const numMatch = window.match(/\b(\d{1,4})\b/)
    if (numMatch) {
      const val = parseInt(numMatch[1])
      if (val > 0 && val < 1000) return val
    }
  }
  return null
}

// ---- Temporal extraction --------------------------------------------------

function extractProjectDurationWeeks(text: string): number {
  // "6-month project", "18 months", "12 month implementation"
  const monthMatch = text.match(/(\d+)\s*[-–]?\s*month\s*(?:project|implementation|engagement|program|timeline|duration)/i)
  if (monthMatch) return Math.round(parseInt(monthMatch[1]) * 4.33)

  const wkMatch = text.match(/(\d+)\s*week\s*(?:project|timeline|sprint|duration)/i)
  if (wkMatch) return parseInt(wkMatch[1])

  const yrMatch = text.match(/(\d+)\s*year\s*(?:project|program|implementation)/i)
  if (yrMatch) return parseInt(yrMatch[1]) * 52

  // Generic "X months" anywhere
  const genericMonth = text.match(/(\d+)\s*months?/i)
  if (genericMonth) {
    const val = parseInt(genericMonth[1])
    if (val >= 1 && val <= 36) return Math.round(val * 4.33)
  }
  return 26 // default 6 months
}

function extractContractMonths(text: string): number {
  const yrMatch = text.match(/(\d+)\s*(?:year|yr)/i)
  if (yrMatch) return parseInt(yrMatch[1]) * 12
  const mMatch = text.match(/(\d+)\s*month/i)
  if (mMatch) {
    const v = parseInt(mMatch[1])
    if (v >= 1 && v <= 120) return v
  }
  return 36
}

// ---- Commercial extraction ------------------------------------------------

function extractRate(text: string): number | undefined {
  const m = text.match(/\$?\s*(\d+)\s*(?:per hour|\/hr|\/hour|hourly|per hr)/i)
  return m ? parseInt(m[1]) : undefined
}

function extractRevenue(text: string): number | undefined {
  const m = text.match(/(?:revenue|contract value|deal value|budget|total value|engagement value)[:\s]*\$?\s*([\d,.]+)\s*(m|million|k|thousand)?/i)
  if (!m) return undefined
  let val = parseFloat(m[1].replace(/,/g, ''))
  const mult = m[2]?.toLowerCase()
  if (mult === 'm' || mult === 'million') val *= 1_000_000
  if (mult === 'k' || mult === 'thousand') val *= 1_000
  return val
}

// ---- Deal name extraction -------------------------------------------------

function extractDealName(text: string): string {
  const nameMatch = text.match(/(?:project|deal|engagement|rfp|for)[:\s]+["']?([^"'\n,]{3,60})/i)
  if (nameMatch) return nameMatch[1].trim()
  const firstLine = text.trim().split('\n')[0].trim()
  if (firstLine.length > 3 && firstLine.length < 80) return firstLine
  return 'Parsed RFP Deal'
}
