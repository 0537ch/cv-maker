'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@/components/ui/button'
import { SectionFormProps, SectionDataItem } from '@/types/cv'

export function DynamicSectionForm({
  data,
  fieldConfig = [],
  onChange,
  sectionHeader,
  onHeaderChange
}: SectionFormProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const pendingUpdatesRef = useRef<Map<string, Map<string, string>>>(new Map())
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const itemIdCounterRef = useRef(0)

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const addItem = () => {
    itemIdCounterRef.current += 1
    const newItem: SectionDataItem = { id: `item-${itemIdCounterRef.current}` }
    fieldConfig.forEach(field => { newItem[field.id] = '' })
    onChange([...data, newItem])
    setExpandedIds(prev => new Set(prev).add(newItem.id as string))
  }

  // Flush pending updates to parent
  const flushUpdates = useCallback(() => {
    const pending = pendingUpdatesRef.current
    if (pending.size === 0) return

    const updatedData = data.map(item => {
      const itemUpdates = pending.get(String(item.id))
      if (!itemUpdates) return item

      const updatedItem = { ...item }
      itemUpdates.forEach((value, fieldId) => {
        (updatedItem as Record<string, unknown>)[fieldId] = value
      })
      return updatedItem
    })

    onChange(updatedData)
    pendingUpdatesRef.current = new Map()
  }, [data, onChange])

  // Debounced update with local storage
  const updateItem = (id: string, fieldId: string, value: string) => {
    // Store in pending updates
    const itemId = String(id)
    if (!pendingUpdatesRef.current.has(itemId)) {
      pendingUpdatesRef.current.set(itemId, new Map())
    }
    pendingUpdatesRef.current.get(itemId)!.set(fieldId, value)

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      flushUpdates()
    }, 500)
  }

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      flushUpdates()
    }
  }, [flushUpdates])

  return (
    <div className="space-y-4">
      {onHeaderChange && (
        <input
          type="text"
          value={sectionHeader || ''}
          onChange={(e) => onHeaderChange(e.target.value)}
          className="text-lg font-bold border-b-2 border-primary pb-1 w-full bg-transparent outline-none"
          placeholder="Section Header"
        />
      )}

      {data.map((item) => (
        <div key={item.id as string} className="border rounded-lg overflow-hidden bg-card">
          <div className="flex items-center gap-2 p-3 bg-muted/30">
            <HugeiconsIcon icon={GripVertical} size={14} className="text-muted-foreground" />
            <button 
              onClick={() => toggleExpanded(item.id as string)}
              className="flex-1 text-left font-medium flex items-center gap-2"
            >
              <HugeiconsIcon icon={expandedIds.has(item.id as string) ? ChevronDown : ChevronUp} size={16} />
              {String(item[fieldConfig[0]?.id] || 'Untitled Item')}
            </button>
            <Button
              variant="ghost" size="sm"
              onClick={() => onChange(data.filter(i => i.id !== item.id))}
              className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
            >
              <HugeiconsIcon icon={Trash2} size={14} />
            </Button>
          </div>

          {expandedIds.has(item.id as string) && (
            <div className="p-4 space-y-3 border-t">
              {fieldConfig.map(field => (
                <div key={field.id}>
                  <label className="text-xs text-muted-foreground mb-1 block">{field.label}</label>
                  <input
                    type={field.type === 'textarea' ? 'text' : field.type}
                    value={String(item[field.id] || '')}
                    onChange={(e) => updateItem(item.id as string, field.id, e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    placeholder={field.label}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <Button onClick={addItem} className="w-full" variant="outline">
        <HugeiconsIcon icon={Plus} size={16} className="mr-2" /> Add Item
      </Button>
    </div>
  )
}