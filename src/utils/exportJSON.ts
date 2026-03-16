import { DealOutput } from '../types/deal'

export function exportJSON(output: DealOutput) {
  const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dealbrkr_${output.deal_name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
