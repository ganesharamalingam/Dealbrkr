import { useState, useCallback } from 'react'
import { DealInput, DealOutput, createDefaultDealInput } from '../types/deal'
import { runEstimation } from '../engine/estimator'
import { useLocalStorage } from './useLocalStorage'

export function useDealEngine() {
  const [input, setInput] = useLocalStorage<DealInput>('dealbrkr_input', createDefaultDealInput())
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
