'use client'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { HugeiconsIcon } from '@hugeicons/react'
import { GripVertical } from '@hugeicons/core-free-icons'

interface SortableItemProps {
  id: string
  label: string
  isSelected: boolean
  onSelect: () => void
}

export function SortableItem({ id, label, isSelected, onSelect }: SortableItemProps) {
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
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted transition-colors text-sm ${
        isSelected ? 'bg-muted border-l-2 border-primary' : ''
      } ${isDragging ? 'ring-2 ring-primary' : ''}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing hover:bg-muted rounded p-1 opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Drag to reorder item"
        onClick={(e) => e.stopPropagation()}
      >
        <HugeiconsIcon icon={GripVertical} className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Label */}
      <span
        className="text-muted-foreground flex-1"
        onClick={onSelect}
      >
        {label}
      </span>
    </div>
  )
}
