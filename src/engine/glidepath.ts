// =========================================
// 3-Year Glidepath Engine
// =========================================

import { Glidepath3Year, GlidepathYear, AICompression } from '../types/deal'
import { GLIDEPATH_RAMP } from './benchmarks'

export function calculateGlidepath(
  annualPreAIHours: number,
  aiCompression: AICompression,
  blendedRate: number,
  fteAnnualHours: number,
): Glidepath3Year {
  const years: GlidepathYear[] = []

  for (let y = 1; y <= 3; y++) {
    const yearKey = `y${y}` as 'y1' | 'y2' | 'y3'

    const conservativeCompression = aiCompression.min_percent * GLIDEPATH_RAMP.conservative[yearKey]
    const expectedCompression = aiCompression.expected_percent * GLIDEPATH_RAMP.expected[yearKey]
    const aggressiveCompression = aiCompression.max_percent * GLIDEPATH_RAMP.aggressive[yearKey]

    const conservativeHours = annualPreAIHours * (1 - conservativeCompression / 100)
    const expectedHours = annualPreAIHours * (1 - expectedCompression / 100)
    const aggressiveHours = annualPreAIHours * (1 - aggressiveCompression / 100)

    years.push({
      year: y,
      conservative_cost: Math.round(conservativeHours * blendedRate),
      expected_cost: Math.round(expectedHours * blendedRate),
      aggressive_cost: Math.round(aggressiveHours * blendedRate),
      conservative_fte: Math.round((conservativeHours / fteAnnualHours) * 10) / 10,
      expected_fte: Math.round((expectedHours / fteAnnualHours) * 10) / 10,
      aggressive_fte: Math.round((aggressiveHours / fteAnnualHours) * 10) / 10,
      conservative_compression: Math.round(conservativeCompression * 10) / 10,
      expected_compression: Math.round(expectedCompression * 10) / 10,
      aggressive_compression: Math.round(aggressiveCompression * 10) / 10,
    })
  }

  return { years }
}
