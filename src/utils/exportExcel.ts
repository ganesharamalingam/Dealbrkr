import * as XLSX from 'xlsx'
import { DealOutput } from '../types/deal'

export function exportExcel(output: DealOutput) {
  const wb = XLSX.utils.book_new()

  // Sheet 1: Summary
  const summaryData = [
    ['DealBrkr — Commercial Estimation Output'],
    [''],
    ['Deal Name', output.deal_name],
    ['Client', output.client_name],
    ['Scenario Type', output.scenario_type],
    ['Confidence Level', output.confidence_level],
    ['Generated At', output.generated_at],
    [''],
    ['SCOPE SUMMARY'],
    ['Total Work Categories', output.scope_summary.total_categories],
    ['Total Volume', output.scope_summary.total_volume],
    ['Coverage Hours', `${output.scope_summary.coverage_hours}h/day`],
    ['Contract Term', `${output.scope_summary.contract_months} months`],
    [''],
    ['EFFORT ESTIMATE'],
    ['Pre-AI Total Hours', output.effort_estimate.pre_ai_hours],
    ['Post-AI Hours (Min Compression)', output.effort_estimate.post_ai_hours_min],
    ['Post-AI Hours (Expected)', output.effort_estimate.post_ai_hours_expected],
    ['Post-AI Hours (Max Compression)', output.effort_estimate.post_ai_hours_max],
    ['FTE (Pre-AI, Annual)', output.effort_estimate.fte_equivalent_pre_ai],
    ['FTE (Post-AI Expected, Annual)', output.effort_estimate.fte_equivalent_post_ai_expected],
    [''],
    ['AI COMPRESSION'],
    ['Min %', output.ai_compression.min_percent],
    ['Expected %', output.ai_compression.expected_percent],
    ['Max %', output.ai_compression.max_percent],
    [''],
    ['COMMERCIAL ESTIMATE'],
    ['Blended Rate', output.commercial_estimate.blended_rate_used],
    ['Total Cost (Pre-AI)', output.commercial_estimate.total_cost_pre_ai],
    ['Total Cost (Post-AI Expected)', output.commercial_estimate.total_cost_post_ai_expected],
    ['Total Cost (Post-AI Max Compression)', output.commercial_estimate.total_cost_post_ai_max],
    ['Revenue Proposed', output.commercial_estimate.revenue_proposed || 'N/A'],
    ['Margin Pre-AI', output.commercial_estimate.margin_pre_ai !== null ? `${output.commercial_estimate.margin_pre_ai}%` : 'N/A'],
    ['Margin Post-AI Expected', output.commercial_estimate.margin_post_ai_expected !== null ? `${output.commercial_estimate.margin_post_ai_expected}%` : 'N/A'],
  ]
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
  ws1['!cols'] = [{ wch: 35 }, { wch: 25 }]
  XLSX.utils.book_append_sheet(wb, ws1, 'Summary')

  // Sheet 2: Category Breakdown
  const catHeaders = ['Category', 'Pre-AI Hours', 'Post-AI Hours (Exp)', 'AI Comp Min%', 'AI Comp Exp%', 'AI Comp Max%']
  const catRows = output.effort_estimate.breakdown_by_category.map(c => [
    c.category_name,
    c.pre_ai_hours,
    c.post_ai_hours_expected,
    c.ai_compression_min,
    c.ai_compression_expected,
    c.ai_compression_max,
  ])
  const ws2 = XLSX.utils.aoa_to_sheet([catHeaders, ...catRows])
  ws2['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Category Breakdown')

  // Sheet 3: 3-Year Glidepath
  const gpHeaders = ['Year', 'Conservative Cost', 'Expected Cost', 'Aggressive Cost', 'Conservative FTE', 'Expected FTE', 'Aggressive FTE', 'Conservative Comp%', 'Expected Comp%', 'Aggressive Comp%']
  const gpRows = output.glidepath_3_year.years.map(y => [
    `Year ${y.year}`,
    y.conservative_cost,
    y.expected_cost,
    y.aggressive_cost,
    y.conservative_fte,
    y.expected_fte,
    y.aggressive_fte,
    y.conservative_compression,
    y.expected_compression,
    y.aggressive_compression,
  ])
  const ws3 = XLSX.utils.aoa_to_sheet([gpHeaders, ...gpRows])
  ws3['!cols'] = Array(10).fill({ wch: 18 })
  XLSX.utils.book_append_sheet(wb, ws3, '3-Year Glidepath')

  // Sheet 4: Assumptions
  const assHeaders = ['Assumption', 'Value', 'Source', 'Impact Level']
  const assRows = output.assumptions.map(a => [
    a.assumption_name,
    a.value,
    a.source,
    a.impact_level,
  ])
  const ws4 = XLSX.utils.aoa_to_sheet([assHeaders, ...assRows])
  ws4['!cols'] = [{ wch: 35 }, { wch: 25 }, { wch: 12 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(wb, ws4, 'Assumptions')

  // Sheet 5: Sensitivity
  const senHeaders = ['Driver', 'Current Value', 'Impact', 'Magnitude', 'Direction']
  const senRows = output.sensitivity_drivers.map(s => [
    s.driver,
    s.current_value,
    s.impact_description,
    s.impact_magnitude,
    s.direction,
  ])
  const ws5 = XLSX.utils.aoa_to_sheet([senHeaders, ...senRows])
  ws5['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 55 }, { wch: 12 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, ws5, 'Sensitivity')

  // Sheet 6: AI Compression Detail
  const aiHeaders = ['Category', 'Min %', 'Expected %', 'Max %', 'Rationale']
  const aiRows = output.ai_compression.by_category.map(c => [
    c.category_name,
    c.min_percent,
    c.expected_percent,
    c.max_percent,
    c.rationale,
  ])
  const ws6 = XLSX.utils.aoa_to_sheet([aiHeaders, ...aiRows])
  ws6['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 55 }]
  XLSX.utils.book_append_sheet(wb, ws6, 'AI Compression Detail')

  // Download
  XLSX.writeFile(wb, `DealBrkr_${output.deal_name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`)
}
