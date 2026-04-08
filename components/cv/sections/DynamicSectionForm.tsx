'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Plus, Trash2 } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { SectionFormProps, SectionDataItem } from '@/types/cv'

export function DynamicSectionForm({
  data,
  fieldConfig = [],
  onChange,
  sectionHeader,
  onHeaderChange
}: SectionFormProps) {
  // Local state for field values to prevent parent re-renders during typing
  const [localFieldValues, setLocalFieldValues] = useState<Map<string, string>>(new Map())
  const [localSectionHeader, setLocalSectionHeader] = useState<string | undefined>(sectionHeader)

  // Use ref to store the latest data and onChange without causing re-renders
  const dataRef = useRef(data)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    dataRef.current = data
    onChangeRef.current = onChange
  })

  // Sync local section header when prop changes
  useEffect(() => {
    setLocalSectionHeader(sectionHeader)
  }, [sectionHeader])

  // Helper to get unique key for each field
  const getFieldKey = (itemId: string, fieldId: string) => `${itemId}-${fieldId}`

  const addItem = () => {
    const newItem: SectionDataItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    fieldConfig.forEach(field => { newItem[field.id] = '' })
    onChange([...data, newItem])
  }

  // Immediate update to parent (no debounce - syncs on blur)
  const updateItem = useCallback((id: string, fieldId: string, value: string) => {
    const updatedData = dataRef.current.map(item => {
      if (String(item.id) !== id) return item
      return { ...item, [fieldId]: value }
    })
    onChangeRef.current(updatedData)
  }, [])

  // Flush any pending local values on unmount (safety net)
  // NOTE: updateItem is NOT in deps to prevent this from running on every keystroke
  useEffect(() => {
    return () => {
      localFieldValues.forEach((value, key) => {
        const parts = key.split('-')
        const itemId = parts.slice(0, -1).join('-')
        const fieldId = parts[parts.length - 1]
        // Use the ref to avoid stale closure
        onChangeRef.current(
          dataRef.current.map(item => {
            if (String(item.id) !== itemId) return item
            return { ...item, [fieldId]: value }
          })
        )
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty deps - only run on unmount

  return (
    <div className="space-y-4">
      {onHeaderChange && (
        <input
          type="text"
          value={localSectionHeader || ''}
          onChange={(e) => setLocalSectionHeader(e.target.value)}
          onBlur={(e) => onHeaderChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onHeaderChange(e.currentTarget.value)
              e.currentTarget.blur()
            }
          }}
          className="min-h-12 text-lg font-bold border-b-2 border-primary pb-1 w-full bg-transparent outline-none"
          placeholder="Section Header"
        />
      )}

      {data.map((item) => (
        <div key={item.id as string} className="space-y-3 relative group">
          {fieldConfig.map(field => {
            const fieldKey = getFieldKey(String(item.id), field.id)
            const localValue = localFieldValues.get(fieldKey)

            return (
              <div key={field.id}>
                {field.type === 'textarea' ? (
                  <Textarea
                    value={localValue ?? String(item[field.id] || '')}
                    onChange={(e) => {
                      setLocalFieldValues(prev =>
                        new Map(prev).set(fieldKey, e.target.value)
                      )
                    }}
                    onBlur={(e) => {
                      // Sync to parent when user leaves the field
                      updateItem(String(item.id), field.id, e.target.value)
                      // Clear local value to free memory
                      setLocalFieldValues(prev => {
                        const next = new Map(prev)
                        next.delete(fieldKey)
                        return next
                      })
                    }}
                    placeholder={field.label}
                    rows={3}
                    className="min-h-24 resize-none"
                  />
                ) : (
                  <input
                    type={field.type}
                    value={localValue ?? String(item[field.id] || '')}
                    onChange={(e) => {
                      setLocalFieldValues(prev =>
                        new Map(prev).set(fieldKey, e.target.value)
                      )
                    }}
                    onBlur={(e) => {
                      // Sync to parent when user leaves the field
                      updateItem(String(item.id), field.id, e.target.value)
                      // Clear local value to free memory
                      setLocalFieldValues(prev => {
                        const next = new Map(prev)
                        next.delete(fieldKey)
                        return next
                      })
                    }}
                    className="min-h-12 w-full px-3 py-2 border rounded-md text-sm"
                    placeholder={field.label}
                  />
                )}
              </div>
            )
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(data.filter(i => i.id !== item.id))}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 h-8 w-8 p-0 absolute top-0 right-0"
          >
            <HugeiconsIcon icon={Trash2} size={14} />
          </Button>
        </div>
      ))}

      <Button onClick={addItem} className="min-h-11 min-w-11 w-full" variant="outline">
        <HugeiconsIcon icon={Plus} size={16} className="mr-2" /> Add Item
      </Button>
    </div>
  )
}