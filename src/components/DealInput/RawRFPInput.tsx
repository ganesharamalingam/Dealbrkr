import { useState, useRef, DragEvent } from 'react'
import { DealInput } from '../../types/deal'
import { parseRFPText } from '../../utils/parseRFP'
import { extractFileText, getFileTypeLabel } from '../../utils/extractFileText'
import { Button } from '../shared/Button'
import { FileText, Wand2, AlertCircle, Upload, X, FileIcon, Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

interface Props {
  rfpText: string
  onRFPTextChange: (text: string) => void
  onApply: (updates: Partial<DealInput>) => void
}

const SAMPLE_RFP = `Project: Managed IT Services for RetailCorp Global

We are seeking an IT managed services partner for a 3-year engagement.

Scope:
- Incident Management: approximately 3,000 tickets per month (L1/L2)
- Service Requests: 800 requests per month (provisioning, access)
- Monitoring & Alerting: 5,000 alerts per month (NOC support)
- Patch Management: 200 servers, monthly patching cycle
- Reporting & Analytics: Weekly and monthly executive dashboards

SLA: 12x5 with P1 response in 15 minutes
Contract value: $4.5 million over 3 years
Rate assumption: $65/hr blended`

const ACCEPTED_TYPES = '.pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.md'

export function RawRFPInput({ rfpText, onRFPTextChange, onApply }: Props) {
  const [parsed, setParsed] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setUploadedFile(file)
    setExtracting(true)
    setParseError(null)
    setParsed(false)
    try {
      const text = await extractFileText(file)
      if (!text.trim()) {
        setParseError('Could not extract text from this file. Try copy-pasting the content instead.')
        setExtracting(false)
        return
      }
      onRFPTextChange(text)
    } catch (e: unknown) {
      setParseError(`Extraction failed: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }
    setExtracting(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const clearFile = () => {
    setUploadedFile(null)
    onRFPTextChange('')
    setParsed(false)
    setParseError(null)
  }

  const handleParse = () => {
    setParseError(null)
    setParsed(false)
    try {
      const result = parseRFPText(rfpText)
      if (result.categories.length === 0) {
        setParseError('Could not extract structured data. Try adding volume numbers like "2000 tickets/month".')
        return
      }
      onApply({
        scenario_type: result.scenario_type,
        deal_name: result.deal_name,
        work_categories: result.categories,
        blended_rate: result.blended_rate,
        revenue_proposed: result.revenue,
        contract_term_months: result.contract_months,
      })
      setParsed(true)
    } catch {
      setParseError('Parsing failed. Please check your input.')
    }
  }

  const loadSample = () => {
    setUploadedFile(null)
    onRFPTextChange(SAMPLE_RFP)
    setParsed(false)
    setParseError(null)
  }

  const fileTypeColor = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    if (ext === 'pdf') return 'bg-red-50 text-red-700 border-red-200'
    if (ext === 'docx' || ext === 'doc') return 'bg-brand-50 text-brand-700 border-brand-200'
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    return 'bg-surface-2 text-ink-2 border-surface-4'
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploadedFile && !extracting && fileInputRef.current?.click()}
        className={clsx(
          'relative rounded-xl border-2 transition-all',
          dragOver
            ? 'border-brand-500 bg-brand-50 cursor-copy'
            : uploadedFile
              ? 'border-surface-3 bg-surface-1 cursor-default'
              : 'border-dashed border-surface-4 bg-white hover:border-brand-400 hover:bg-brand-50/30 cursor-pointer'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleFileInput}
          className="hidden"
        />

        {extracting ? (
          <div className="flex flex-col items-center gap-2 py-6 text-brand-600">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm font-medium">Extracting text from {uploadedFile?.name}…</span>
            <span className="text-xs text-ink-3">Processing in browser — no upload to server</span>
          </div>
        ) : uploadedFile ? (
          <div className="flex items-center gap-3 px-4 py-3">
            <FileIcon className="w-5 h-5 text-ink-3 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-ink-0 truncate">{uploadedFile.name}</span>
                <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full border', fileTypeColor(uploadedFile))}>
                  {getFileTypeLabel(uploadedFile)}
                </span>
              </div>
              <div className="text-xs text-ink-3 mt-0.5">
                {rfpText ? `${rfpText.split('\n').length} lines extracted — ready to parse` : 'Processing…'}
              </div>
            </div>
            <button
              onClick={e => { e.stopPropagation(); clearFile() }}
              className="p-1.5 rounded-lg hover:bg-surface-3 text-ink-3 hover:text-ink-1 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-6 select-none">
            <Upload className="w-6 h-6 text-ink-3" />
            <div className="text-sm font-medium text-ink-1">Drop RFP document here or click to browse</div>
            <div className="text-xs text-ink-4">PDF · Word (.docx) · Excel (.xlsx) · CSV · Text</div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-2 text-xs text-ink-4">
        <div className="flex-1 h-px bg-surface-3" />
        <span>or paste text directly</span>
        <div className="flex-1 h-px bg-surface-3" />
      </div>

      {/* Text area header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-ink-2">
          <FileText className="w-4 h-4 text-ink-3" />
          <span>RFP / deal description text</span>
        </div>
        <Button variant="ghost" size="sm" onClick={loadSample}>
          Load sample
        </Button>
      </div>

      <textarea
        value={rfpText}
        onChange={e => { onRFPTextChange(e.target.value); setParsed(false); setParseError(null) }}
        rows={10}
        placeholder={`Paste RFP text here...\n\nExamples of what gets extracted:\n• "3,000 tickets per month" → Incident Management category\n• "800 requests/month" → Service Requests category\n• "3 year" or "36 months" → contract term\n• "budget: $4.5 million" → revenue\n• "$65/hr" → blended rate`}
        className="block w-full rounded-xl border border-surface-4 bg-white px-4 py-3 text-sm text-ink-0 placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors font-mono resize-y"
      />

      {parseError && (
        <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2.5">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{parseError}</span>
        </div>
      )}

      {parsed && (
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2.5">
          <span className="text-base">✓</span>
          <span>Parsed successfully. Work categories populated — switch to Structured mode to review and adjust.</span>
        </div>
      )}

      <Button
        variant="primary"
        icon={<Wand2 className="w-4 h-4" />}
        onClick={handleParse}
        disabled={!rfpText.trim() || extracting}
        className="w-full"
      >
        Parse RFP → Auto-fill Scope
      </Button>

      <p className="text-xs text-ink-4">
        All file processing happens in your browser — nothing is uploaded to any server.
        Parser extracts: volume numbers, units, contract duration, blended rate, revenue.
      </p>
    </div>
  )
}
