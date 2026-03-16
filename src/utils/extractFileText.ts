// =========================================
// Client-Side File Text Extraction
// Supports: PDF, DOCX, XLSX/XLS/CSV, TXT
// All processing is in-browser — no backend.
// =========================================

import * as XLSX from 'xlsx'

// ----- PDF -----
async function extractFromPDF(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist')
  // Use CDN worker to avoid bundler complications with large worker files
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).href

  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
  const pdf = await loadingTask.promise
  const pages: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item: unknown) => {
        if (typeof item === 'object' && item !== null && 'str' in item) {
          return (item as { str: string }).str
        }
        return ''
      })
      .join(' ')
    pages.push(pageText)
  }

  return pages.join('\n\n')
}

// ----- DOCX -----
async function extractFromDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth')
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}

// ----- XLSX / XLS / CSV -----
async function extractFromExcel(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const wb = XLSX.read(arrayBuffer, { type: 'array' })
  const lines: string[] = []

  wb.SheetNames.forEach(sheetName => {
    lines.push(`[Sheet: ${sheetName}]`)
    const ws = wb.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 }) as unknown[][]
    rows.forEach(row => {
      const cells = (row as (string | number | null | undefined)[])
        .map(c => (c === null || c === undefined ? '' : String(c)))
      lines.push(cells.join('\t'))
    })
    lines.push('')
  })

  return lines.join('\n')
}

// ----- TXT -----
function extractFromText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read text file'))
    reader.readAsText(file)
  })
}

// ----- Main dispatcher -----
export async function extractFileText(file: File): Promise<string> {
  const name = file.name.toLowerCase()
  const ext = name.split('.').pop() || ''

  if (ext === 'pdf') return extractFromPDF(file)
  if (ext === 'docx' || ext === 'doc') return extractFromDocx(file)
  if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') return extractFromExcel(file)
  if (ext === 'txt' || ext === 'text' || ext === 'md') return extractFromText(file)

  // Fallback: try as text
  return extractFromText(file)
}

export function getFileTypeLabel(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  const map: Record<string, string> = {
    pdf: 'PDF',
    docx: 'Word',
    doc: 'Word',
    xlsx: 'Excel',
    xls: 'Excel',
    csv: 'CSV',
    txt: 'Text',
    md: 'Markdown',
  }
  return map[ext] || ext.toUpperCase()
}
