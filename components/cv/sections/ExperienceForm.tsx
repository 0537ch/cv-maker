'use client'
import { Experience } from '@/types/cv'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { GripVertical, Trash2, ChevronDown, ChevronRight, Pencil } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export function ExperienceForm({
  data,
  onChange,
  sectionHeader,
  onHeaderChange
}: {
  data: Experience[]
  onChange: (data: Experience[]) => void
  sectionHeader?: string
  onHeaderChange?: (header: string) => void
}) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Experience>({
    id: '',
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  })
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const startEdit = (exp: Experience) => {
    setEditingId(exp.id)
    setEditForm(exp)
    setExpandedItems(prev => new Set(prev).add(exp.id))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({
      id: '',
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    })
  }

  const saveEdit = () => {
    if (!editingId) return
    onChange(data.map(exp => exp.id === editingId ? editForm : exp))
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    onChange(data.filter(exp => exp.id !== id))
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropId: string) => {
    e.preventDefault()
    if (!draggedId || draggedId === dropId) return

    const draggedIndex = data.findIndex(exp => exp.id === draggedId)
    const dropIndex = data.findIndex(exp => exp.id === dropId)

    if (draggedIndex === -1 || dropIndex === -1) return

    const newData = [...data]
    const [removed] = newData.splice(draggedIndex, 1)
    newData.splice(dropIndex, 0, removed)

    onChange(newData)
    setDraggedId(null)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
  }

  const defaultHeader = 'Professional Experience'
  const [itemIdCounter, setItemIdCounter] = useState(0)

  const [newExp, setNewExp] = useState<Experience>({
    id: '',
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  })

  const handleAdd = () => {
    if (!newExp.company || !newExp.position) return

    onChange([
      ...data,
      { ...newExp, id: `exp-${itemIdCounter}` }
    ])

    setItemIdCounter(prev => prev + 1)
    setNewExp({
      id: '',
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    })
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Present'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-4">
      {/* Section Header Customization */}
      {onHeaderChange && (
        <div className="space-y-2 pb-4 border-b">
          <Label htmlFor="sectionHeader">Section Header</Label>
          <Input
            id="sectionHeader"
            value={sectionHeader || defaultHeader}
            onChange={(e) => onHeaderChange(e.target.value)}
            placeholder="Professional Experience"
          />
          <p className="text-xs text-muted-foreground">
            Customize the section title that appears on your CV
          </p>
        </div>
      )}

      {/* Experience Items */}
      <div className="space-y-2">
        {data.map((exp) => (
          <div
            key={exp.id}
            draggable
            onDragStart={(e) => handleDragStart(e, exp.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, exp.id)}
            onDragEnd={handleDragEnd}
            className={`border rounded-lg overflow-hidden transition-all ${
              draggedId === exp.id ? 'opacity-50 ring-2 ring-primary' : ''
            }`}
          >
            {/* Header - Always Visible */}
            <div className="flex items-center gap-2 p-3 bg-background hover:bg-muted/50 transition-colors">
              <div className="cursor-grab active:cursor-grabbing">
                <HugeiconsIcon icon={GripVertical} size={16} className="text-muted-foreground" />
              </div>
              <button
                onClick={() => toggleExpand(exp.id)}
                className="flex items-center gap-2 flex-1 text-left"
              >
                <HugeiconsIcon
                  icon={expandedItems.has(exp.id) ? ChevronDown : ChevronRight}
                  size={14}
                />
                <span className="text-sm font-medium">
                  {exp.position || 'Position'} at {exp.company || 'Company'}
                </span>
              </button>
              <span className="text-xs text-muted-foreground">
                {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate || '')}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => startEdit(exp)}
              >
                <HugeiconsIcon icon={Pencil} size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(exp.id)}
              >
                <HugeiconsIcon icon={Trash2} size={14} />
              </Button>
            </div>

            {/* Expanded Content */}
            {expandedItems.has(exp.id) && (
              <div className="p-3 border-t bg-muted/30 space-y-3">
                {editingId === exp.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input
                          value={editForm.company}
                          onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                          placeholder="Company name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Position</Label>
                        <Input
                          value={editForm.position}
                          onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                          placeholder="Job title"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={editForm.startDate}
                          onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={editForm.endDate}
                          onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                          disabled={editForm.current}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`edit-current-${exp.id}`}
                        checked={editForm.current}
                        onChange={(e) => setEditForm({ ...editForm, current: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor={`edit-current-${exp.id}`}>I currently work here</Label>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        placeholder="Describe your responsibilities and achievements..."
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={saveEdit} size="sm">
                        Save
                      </Button>
                      <Button onClick={cancelEdit} variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Company:</span> {exp.company || '-'}
                      </div>
                      <div>
                        <span className="font-medium">Position:</span> {exp.position || '-'}
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span>{' '}
                        {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate || '')}
                      </div>
                    </div>
                    {exp.description && (
                      <div className="text-sm">
                        <span className="font-medium">Description:</span>
                        <p className="mt-1 whitespace-pre-wrap">{exp.description}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No experience added yet. Add your first work experience below.
          </div>
        )}
      </div>

      {/* Add New Experience */}
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-4">Add Experience</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={newExp.company}
                onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                placeholder="Company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Input
                id="position"
                value={newExp.position}
                onChange={(e) => setNewExp({ ...newExp, position: e.target.value })}
                placeholder="Job title"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={newExp.startDate}
                onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={newExp.endDate}
                onChange={(e) => setNewExp({ ...newExp, endDate: e.target.value })}
                disabled={newExp.current}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="current"
              checked={newExp.current}
              onChange={(e) => setNewExp({ ...newExp, current: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="current">I currently work here</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={newExp.description}
              onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
              placeholder="Describe your responsibilities and achievements..."
              rows={4}
            />
          </div>

          <Button onClick={handleAdd} className="w-full">
            + Add Experience
          </Button>
        </div>
      </div>
    </div>
  )
}
