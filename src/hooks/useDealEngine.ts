import { useState, useCallback } from 'react'
import { DealInput, DealOutput, createDefaultDealInput } from '../types/deal'
import { runEstimation } from '../engine/estimator'
import { useLocalStorage } from './useLocalStorage'

export function useDealEngine() {
  // v2 key forces fresh state after adding project_duration_weeks
  const [storedInput, setInput] = useLocalStorage<DealInput>('dealbrkr_input_v2', createDefaultDealInput())

  // Merge with defaults so any missing fields (e.g. after schema changes) are filled in
  const defaults = createDefaultDealInput()
  const input: DealInput = { ...defaults, ...storedInput }
  const [output, setOutput] = useState<DealOutput | null>(null)
  const [error, setError] = useState<string | null>(null)

  const estimate = useCallback(() => {
    setError(null)
    try {
      if (input.work_categories.length === 0) {
        setError('Add at least one work category to generate an estimate.')
        return
      }
      const result = runEstimation(input)
      setOutput(result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Estimation failed.')
    }
  }, [input])

  const reset = useCallback(() => {
    setInput(createDefaultDealInput())
    setOutput(null)
    setError(null)
  }, [setInput])

  const updateInput = useCallback((updates: Partial<DealInput>) => {
    setInput(prev => ({ ...prev, ...updates }))
  }, [setInput])

  return { input, output, error, estimate, reset, updateInput, setInput }
}
