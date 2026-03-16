import { DealOutput } from '../../types/deal'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface Props {
  output: DealOutput
}

export function JSONOutput({ output }: Props) {
  const [copied, setCopied] = useState(false)
  const json = JSON.stringify(output, null, 2)

  const handleCopy = () => {
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-3">
          Full structured JSON output — matches the DealBrkr output schema. Copy for API / downstream use.
        </p>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border border-surface-3 bg-white hover:bg-surface-1 transition-colors text-ink-2"
        >
          {copied
            ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</>
            : <><Copy className="w-3.5 h-3.5" /> Copy JSON</>
          }
        </button>
      </div>

      <pre className="bg-ink-0 text-emerald-400 rounded-xl p-4 text-xs font-mono overflow-auto max-h-[600px] leading-relaxed whitespace-pre">
        {json}
      </pre>
    </div>
  )
}
