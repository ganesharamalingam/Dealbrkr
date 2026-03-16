import { WorkCategory, createDefaultWorkCategory } from '../../types/deal'
import { Input } from '../shared/Input'
import { Select } from '../shared/Select'
import { Button } from '../shared/Button'
import { VOLUME_UNITS, ROLE_OPTIONS } from '../../engine/benchmarks'
import { Plus, Trash2, ChevronDown, ChevronUp, UserPlus, X } from 'lucide-react'
import { useState } from 'react'
import { clsx } from 'clsx'

interface Props {
  categories: WorkCategory[]
  onChange: (categories: WorkCategory[]) => void
}

const complexityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const volumeUnitOptions = VOLUME_UNITS.map(u => ({ value: u, label: u }))
const roleOptions = ROLE_OPTIONS.map(r => ({ value: r, label: r }))

export function ScopeBuilder({ categories, onChange }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const addCategory = () => {
    const newCat = createDefaultWorkCategory()
    onChange([...categories, newCat])
    setExpanded(prev => new Set(prev).add(newCat.id))
  }

  const removeCategory = (id: string) => {
    onChange(categories.filter(c => c.id !== id))
    setExpanded(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const updateCategory = (id: string, updates: Partial<WorkCategory>) => {
    onChange(categories.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const addRole = (catId: string) => {
    const cat = categories.find(c => c.id === catId)
    if (!cat) return
    updateCategory(catId, {
      roles: [...cat.roles, { role: 'Engineer', percentage: 0 }]
    })
  }

  const removeRole = (catId: string, index: number) => {
    const cat = categories.find(c => c.id === catId)
    if (!cat) return
    updateCategory(catId, {
      roles: cat.roles.filter((_, i) => i !== index)
    })
  }

  const updateRole = (catId: string, index: number, field: 'role' | 'percentage', value: string | number) => {
    const cat = categories.find(c => c.id === catId)
    if (!cat) return
    const newRoles = cat.roles.map((r, i) =>
      i === index ? { ...r, [field]: value } : r
    )
    updateCategory(catId, { roles: newRoles })
  }

  const getRoleTotal = (cat: WorkCategory) =>
    cat.roles.reduce((sum, r) => sum + (r.percentage || 0), 0)

  return (
    <div className="space-y-3">
      {categories.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-surface-4 rounded-xl text-ink-3 text-sm">
          No work categories defined. Add one to start building your scope.
        </div>
      )}

      {categories.map((cat, idx) => {
        const isExpanded = expanded.has(cat.id)
        const roleTotal = getRoleTotal(cat)
        const roleTotalOk = Math.abs(roleTotal - 100) < 0.5

        return (
          <div
            key={cat.id}
            className="border border-surface-3 rounded-xl bg-white overflow-hidden"
          >
            {/* Header row */}
            <div className="flex items-center gap-3 px-4 py-3 bg-surface-1">
              <span className="text-xs font-mono text-ink-4 w-5 text-center">{idx + 1}</span>
              <input
                type="text"
                value={cat.name}
                onChange={e => updateCategory(cat.id, { name: e.target.value })}
                placeholder="Category name (e.g. Incident Management)"
                className="flex-1 text-sm font-medium bg-transparent border-none outline-none text-ink-0 placeholder:text-ink-4"
              />
              <div className="flex items-center gap-1">
                {cat.volume > 0 && (
                  <span className="text-xs text-ink-3 font-mono bg-surface-2 px-2 py-0.5 rounded hidden sm:inline">
                    {cat.volume} {cat.volume_unit}
                  </span>
                )}
                <button
                  onClick={() => toggleExpand(cat.id)}
                  className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors text-ink-3"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => removeCategory(cat.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors text-ink-3"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expanded details */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-2 border-t border-surface-3 space-y-4">
                {/* Volume + AHT + Complexity */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Input
                    label="Volume"
                    type="number"
                    min={0}
                    value={cat.volume || ''}
                    onChange={e => updateCategory(cat.id, { volume: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                  <Select
                    label="Unit"
                    options={volumeUnitOptions}
                    value={cat.volume_unit}
                    onChange={e => updateCategory(cat.id, { volume_unit: e.target.value })}
                  />
                  <Input
                    label="AHT (hours)"
                    type="number"
                    min={0}
                    step={0.25}
                    value={cat.aht_hours || ''}
                    onChange={e => updateCategory(cat.id, { aht_hours: parseFloat(e.target.value) || 0 })}
                    hint="Avg handle time per unit"
                    placeholder="1"
                  />
                  <Select
                    label="Complexity"
                    options={complexityOptions}
                    value={cat.complexity}
                    onChange={e => updateCategory(cat.id, { complexity: e.target.value as WorkCategory['complexity'] })}
                  />
                </div>

                {/* Monthly hours preview */}
                {cat.volume > 0 && cat.aht_hours > 0 && (
                  <div className="flex gap-4 text-xs text-ink-3 bg-surface-1 rounded-lg px-3 py-2">
                    <span>Monthly hours: <strong className="text-ink-1">{(cat.volume * cat.aht_hours * (cat.complexity === 'high' ? 1.5 : cat.complexity === 'low' ? 0.7 : 1)).toFixed(0)}</strong></span>
                    <span className="text-ink-4">•</span>
                    <span>Complexity multiplier: <strong className="text-ink-1">{cat.complexity === 'high' ? '1.5×' : cat.complexity === 'low' ? '0.7×' : '1.0×'}</strong></span>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-ink-1 mb-1">Notes (optional)</label>
                  <input
                    type="text"
                    value={cat.notes || ''}
                    onChange={e => updateCategory(cat.id, { notes: e.target.value })}
                    placeholder="Additional context..."
                    className="block w-full rounded-lg border border-surface-4 bg-white px-3 py-2 text-sm text-ink-0 placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                  />
                </div>

                {/* Role allocation */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-ink-1">Role Allocation</label>
                    <div className="flex items-center gap-2">
                      <span className={clsx(
                        'text-xs font-mono px-2 py-0.5 rounded',
                        roleTotalOk ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      )}>
                        {roleTotal.toFixed(0)}% / 100%
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<UserPlus className="w-3 h-3" />}
                        onClick={() => addRole(cat.id)}
                      >
                        Add Role
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {cat.roles.map((role, rIdx) => (
                      <div key={rIdx} className="flex gap-2 items-center">
                        <select
                          value={role.role}
                          onChange={e => updateRole(cat.id, rIdx, 'role', e.target.value)}
                          className="flex-1 rounded-lg border border-surface-4 bg-white px-3 py-1.5 text-sm text-ink-0 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                        >
                          {roleOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <div className="relative w-24">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={role.percentage || ''}
                            onChange={e => updateRole(cat.id, rIdx, 'percentage', parseFloat(e.target.value) || 0)}
                            className="block w-full rounded-lg border border-surface-4 bg-white px-3 py-1.5 pr-7 text-sm text-ink-0 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                            placeholder="0"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-3 text-xs">%</span>
                        </div>
                        {cat.roles.length > 1 && (
                          <button
                            onClick={() => removeRole(cat.id, rIdx)}
                            className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors text-ink-4"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {!roleTotalOk && (
                    <p className="text-xs text-amber-600 mt-1">Role percentages should total 100%</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}

      <Button
        variant="secondary"
        icon={<Plus className="w-4 h-4" />}
        onClick={addCategory}
        className="w-full"
      >
        Add Work Category
      </Button>
    </div>
  )
}
