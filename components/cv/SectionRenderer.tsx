'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronRight, Trash2 } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@/components/ui/button'
import { SECTION_REGISTRY } from '@/lib/section-registry'
import { CVSection } from '@/types/cv' // Removed CVData as it was unused

interface SectionRendererProps {
  section: CVSection
  // cvData: CVData <- Removed unused prop
  onChange: (section: CVSection) => void
  onDelete?: () => void
  isExpanded: boolean
  onToggle: () => void
}

export function SectionRenderer({ 
  section, 
  onChange, 
  onDelete, 
  isExpanded, 
  onToggle 
}: SectionRendererProps) {
  const config = SECTION_REGISTRY[section.type] || SECTION_REGISTRY.custom
  const FormComponent = config.formComponent

  const [localHeader, setLocalHeader] = useState(section.header)

  // Debounced header update to prevent focus loss
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (localHeader !== section.header) {
        onChange({
          ...section,
          header: localHeader
        })
      }
    }, 500)

    return () => clearTimeout(timeout)
  }, [localHeader, section, onChange])

  const handleDataChange = useCallback((newData: unknown[]) => {
    onChange({
      ...section,
      data: newData
    })
  }, [section, onChange])

  const handleHeaderChange = useCallback((newHeader: string) => {
    setLocalHeader(newHeader)
  }, [])

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="relative">
        <button
          onClick={onToggle}
          aria-expanded={isExpanded}
          className="w-full flex items-center gap-2 p-3 bg-muted/50 hover:bg-muted/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring pr-16"
        >
          <HugeiconsIcon icon={isExpanded ? ChevronDown : ChevronRight} size={16} />
          <HugeiconsIcon icon={config.icon} size={16} />
          <span className="font-semibold">{section.label}</span>
          <span className="text-xs text-muted-foreground ml-auto">
            {Array.isArray(section.data) ? section.data.length : 0} items
          </span>
        </button>
        {onDelete && section.isCustom && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Delete this section?')) onDelete()
            }}
            aria-label={`Delete ${section.label} section`}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
          >
            <HugeiconsIcon icon={Trash2} size={14} />
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="p-4 border-t">
          <FormComponent
            data={section.data as Record<string, unknown>[]}
            onChange={handleDataChange}
            sectionHeader={localHeader}
            onHeaderChange={handleHeaderChange}
            fieldConfig={section.fieldConfig}
          />
        </div>
      )}
    </div>
  )
}