import { ReactNode, useState } from 'react'
import { clsx } from 'clsx'

interface TooltipProps {
  content: string
  children: ReactNode
}

export function Tooltip({ content, children }: TooltipProps) {
  const [show, setShow] = useState(false)

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span className={clsx(
          'absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2',
          'px-3 py-1.5 text-xs text-white bg-ink-0 rounded-lg shadow-elevated',
          'whitespace-nowrap animate-fade-in'
        )}>
          {content}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-ink-0" />
        </span>
      )}
    </span>
  )
}
