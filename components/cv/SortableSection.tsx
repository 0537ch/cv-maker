'use client'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { HugeiconsIcon } from '@hugeicons/react'
import { GripVertical, ChevronDown, ChevronRight } from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'

interface SortableSectionProps {
  id: string
  label: string
  icon?: IconSvgElement
  count?: number
  isExpanded: boolean
  onToggle: () => void
  isSelected: boolean
  onSelect: () => void
  children: React.ReactNode
}

export function SortableSection({
  id,
  label,
  icon,
  count,
  isExpanded,
  onToggle,
  isSelected,
  onSelect,
  children,
}: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 150ms ease',
    opacity: isDragging ? 0.5 : 1,
    scale: isDragging ? 0.98 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-muted transition-colors ${
          isSelected ? 'bg-muted' : ''
        } ${isDragging ? 'ring-2 ring-primary' : ''}`}
        onClick={onSelect}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing hover:bg-muted rounded p-1 opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Drag to reorder section"
        >
          <HugeiconsIcon icon={GripVertical} className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Expand/Collapse Icon */}
        <HugeiconsIcon
          icon={isExpanded ? ChevronDown : ChevronRight}
          className="h-4 w-4 text-muted-foreground"
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
          }}
        />

        {/* Section Icon */}
        {icon && <HugeiconsIcon icon={icon} className="h-4 w-4" />}

        {/* Label */}
        <span className="flex-1 text-sm font-medium">{label}</span>

        {/* Count */}
        {count !== undefined && (
          <span className="text-xs text-muted-foreground">{count}</span>
        )}
      </div>

      {/* Children */}
      {isExpanded && <div className="ml-4 mt-1 space-y-0.5">{children}</div>}
    </div>
  )
}
