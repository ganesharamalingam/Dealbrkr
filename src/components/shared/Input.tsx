import { clsx } from 'clsx'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  suffix?: string
  prefix?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, suffix, prefix, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-ink-1">
            {label}
          </label>
        )}
        <div className="relative">
          {prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 text-sm">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            className={clsx(
              'block w-full rounded-lg border border-surface-4 bg-white px-3 py-2 text-sm text-ink-0',
              'placeholder:text-ink-4',
              'focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
              'transition-colors',
              error && 'border-red-400 focus:ring-red-500/20 focus:border-red-500',
              prefix && 'pl-8',
              suffix && 'pr-12',
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 text-xs font-medium">
              {suffix}
            </span>
          )}
        </div>
        {hint && !error && <p className="text-xs text-ink-3">{hint}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
