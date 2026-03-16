// =========================================
// Simple RFP Text Parser
// =========================================

import { WorkCategory, ScenarioType, createDefaultWorkCategory } from '../types/deal'

interface ParsedRFP {
  scenario_type: ScenarioType
  deal_name: string
  categories: WorkCategory[]
  blended_rate?: number
  revenue?: number
  contract_months: number
}

export function parseRFPText(text: string): ParsedRFP {
  const lower = text.toLowerCase()

  // Detect scenario type
  let scenario_type: ScenarioType = 'managed_services'
  if (lower.includes('implement') || lower.includes('greenfield') || lower.includes('build')) {
    scenario_type = 'greenfield_implementation'
  } else if (lower.includes('product') || lower.includes('feature') || lower.includes('sprint')) {
    scenario_type = 'product_feature_development'
  } else if (lower.includes('t&m') || lower.includes('time and material') || lower.includes('capacity')) {
    scenario_type = 'tm_capacity'
  } else if (lower.includes('hybrid')) {
    scenario_type = 'hybrid'
  }

  // Extract numbers with context
  const categories: WorkCategory[] = []

  // Pattern: "X tickets/month" or "X incidents per month"
  const volumePatterns = [
    /(\d[\d,]*)\s*(tickets?|incidents?|requests?|alerts?|issues?)\s*(?:per|\/)\s*(month|week|day)/gi,
    /(\d[\d,]*)\s*(?:monthly|per month)\s*(tickets?|incidents?|requests?|alerts?)/gi,
    /(?:volume|expected|approximately|about|~)\s*(\d[\d,]*)\s*(tickets?|incidents?|requests?|alerts?)/gi,
  ]

  const seenCategories = new Set<string>()

  volumePatterns.forEach(pattern => {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const volume = parseInt(match[1].replace(/,/g, ''))
      const unitRaw = match[2].toLowerCase().replace(/s$/, '')

      const categoryName = unitRaw === 'ticket' ? 'Incident Management' :
                           unitRaw === 'incident' ? 'Incident Management' :
                           unitRaw === 'request' ? 'Service Requests' :
                           unitRaw === 'alert' ? 'Monitoring & Alerting' :
                           unitRaw === 'issue' ? 'Issue Resolution' :
                           'General Support'

      if (!seenCategories.has(categoryName)) {
        seenCategories.add(categoryName)
        const cat = createDefaultWorkCategory()
        cat.name = categoryName
        cat.volume = volume
        cat.volume_unit = `${unitRaw}s/month`
        cat.aht_hours = unitRaw === 'alert' ? 0.25 : unitRaw === 'request' ? 0.75 : 1.0
        cat.complexity = volume > 5000 ? 'high' : volume > 1000 ? 'medium' : 'low'
        categories.push(cat)
      }
    }
  })

  // Feature/module patterns
  const featurePattern = /(\d+)\s*(features?|modules?|components?|endpoints?|apis?|microservices?)/gi
  let fMatch
  while ((fMatch = featurePattern.exec(text)) !== null) {
    const vol = parseInt(fMatch[1])
    const unit = fMatch[2].toLowerCase()
    const catName = unit.includes('module') ? 'Module Development' :
                    unit.includes('feature') ? 'Feature Development' :
                    unit.includes('endpoint') ? 'API Development' :
                    unit.includes('api') ? 'API Development' :
                    'Component Development'
    if (!seenCategories.has(catName)) {
      seenCategories.add(catName)
      const cat = createDefaultWorkCategory()
      cat.name = catName
      cat.volume = vol
      cat.volume_unit = `${unit}`
      cat.aht_hours = unit.includes('module') ? 80 : unit.includes('feature') ? 40 : 16
      cat.complexity = 'medium'
      cat.roles = [
        { role: 'Engineer', percentage: 60 },
        { role: 'QA Engineer', percentage: 25 },
        { role: 'Project Manager', percentage: 15 },
      ]
      categories.push(cat)
    }
  }

  // Extract contract duration
  let contract_months = 36
  const durationMatch = text.match(/(\d+)\s*(?:year|yr)/i)
  if (durationMatch) {
    contract_months = parseInt(durationMatch[1]) * 12
  }
  const monthMatch = text.match(/(\d+)\s*month/i)
  if (monthMatch) {
    contract_months = parseInt(monthMatch[1])
  }

  // Extract rate
  let blended_rate: number | undefined
  const rateMatch = text.match(/\$?\s*(\d+)\s*(?:per hour|\/hr|\/hour|hourly)/i)
  if (rateMatch) {
    blended_rate = parseInt(rateMatch[1])
  }

  // Extract revenue
  let revenue: number | undefined
  const revenueMatch = text.match(/(?:revenue|contract value|deal value|budget)[:\s]*\$?\s*([\d,.]+)\s*(m|million|k|thousand)?/i)
  if (revenueMatch) {
    let val = parseFloat(revenueMatch[1].replace(/,/g, ''))
    const mult = revenueMatch[2]?.toLowerCase()
    if (mult === 'm' || mult === 'million') val *= 1000000
    if (mult === 'k' || mult === 'thousand') val *= 1000
    revenue = val
  }

  // If no categories found, add generic ones
  if (categories.length === 0) {
    const cat = createDefaultWorkCategory()
    cat.name = 'General Scope'
    cat.volume = 100
    cat.volume_unit = 'units/month'
    cat.aht_hours = 2
    cat.complexity = 'medium'
    categories.push(cat)
  }

  return {
    scenario_type,
    deal_name: extractDealName(text),
    categories,
    blended_rate,
    revenue,
    contract_months,
  }
}

function extractDealName(text: string): string {
  // Try to find a deal/project name
  const nameMatch = text.match(/(?:project|deal|engagement|rfp)[:\s]+["']?([^"'\n,]{3,50})/i)
  if (nameMatch) return nameMatch[1].trim()
  // Use first meaningful line
  const firstLine = text.trim().split('\n')[0].trim()
  if (firstLine.length > 3 && firstLine.length < 80) return firstLine
  return 'Parsed RFP Deal'
}
