'use client'
import { Education } from '@/types/cv'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { GripVertical, Trash2, ChevronDown, ChevronRight, Pencil } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export function EducationForm({
  data,
  onChange,
  sectionHeader,
  onHeaderChange
}: {
  data: Education[]
  onChange: (data: Education[]) => void
  sectionHeader?: string
  onHeaderChange?: (header: string) => void
}) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Education>({
    id: '',
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    gpa: ''
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

  const startEdit = (edu: Education) => {
    setEditingId(edu.id)
    setEditForm(edu)
    setExpandedItems(prev => new Set(prev).add(edu.id))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({
      id: '',
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: ''
    })
  }

  const saveEdit = () => {
    if (!editingId) return
    onChange(data.map(edu => edu.id === editingId ? editForm : edu))
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    onChange(data.filter(edu => edu.id !== id))
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

    const draggedIndex = data.findIndex(edu => edu.id === draggedId)
    const dropIndex = data.findIndex(edu => edu.id === dropId)

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

  const defaultHeader = 'Education'
  const [itemIdCounter, setItemIdCounter] = useState(0)

  const [newEdu, setNewEdu] = useState<Education>({
    id: '',
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    gpa: ''
  })

  const handleAdd = () => {
    if (!newEdu.institution || !newEdu.degree) return

    onChange([
      ...data,
      { ...newEdu, id: `edu-${itemIdCounter}` }
    ])

    setItemIdCounter(prev => prev + 1)
    setNewEdu({
      id: '',
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: ''
    })
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
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
            placeholder="Education"
          />
          <p className="text-xs text-muted-foreground">
            Customize the section title that appears on your CV
          </p>
        </div>
      )}

      {/* Education Items */}
      <div className="space-y-2">
        {data.map((edu) => (
          <div
            key={edu.id}
            draggable
            onDragStart={(e) => handleDragStart(e, edu.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, edu.id)}
            onDragEnd={handleDragEnd}
            className={`border rounded-lg overflow-hidden transition-all ${
              draggedId === edu.id ? 'opacity-50 ring-2 ring-primary' : ''
            }`}
          >
            {/* Header - Always Visible */}
            <div className="flex items-center gap-2 p-3 bg-background hover:bg-muted/50 transition-colors">
              <div className="cursor-grab active:cursor-grabbing">
                <HugeiconsIcon icon={GripVertical} size={16} className="text-muted-foreground" />
              </div>
              <button
                onClick={() => toggleExpand(edu.id)}
                className="flex items-center gap-2 flex-1 text-left"
              >
                <HugeiconsIcon
                  icon={expandedItems.has(edu.id) ? ChevronDown : ChevronRight}
                  size={14}
                />
                <span className="text-sm font-medium">
                  {edu.degree || 'Degree'} from {edu.institution || 'Institution'}
                </span>
              </button>
              <span className="text-xs text-muted-foreground">
                {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 min-h-[44px] min-w-[44px]"
                onClick={() => startEdit(edu)}
              >
                <HugeiconsIcon icon={Pencil} size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 min-h-[44px] min-w-[44px] text-muted-foreground hover:text-destructive hover:bg-destructive/20"
                onClick={() => handleDelete(edu.id)}
              >
                <HugeiconsIcon icon={Trash2} size={16} />
              </Button>
            </div>

            {/* Expanded Content */}
            {expandedItems.has(edu.id) && (
              <div className="p-3 border-t bg-muted/30 space-y-3">
                {editingId === edu.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Institution</Label>
                      <Input
                        value={editForm.institution}
                        onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
                        placeholder="University name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Degree</Label>
                      <Input
                        value={editForm.degree}
                        onChange={(e) => setEditForm({ ...editForm, degree: e.target.value })}
                        placeholder="Bachelor's, Master's, PhD, etc."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Field of Study</Label>
                      <Input
                        value={editForm.field}
                        onChange={(e) => setEditForm({ ...editForm, field: e.target.value })}
                        placeholder="Computer Science, Business, etc."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>GPA (Optional)</Label>
                      <Input
                        value={editForm.gpa}
                        onChange={(e) => setEditForm({ ...editForm, gpa: e.target.value })}
                        placeholder="3.5"
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
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Institution:</span> {edu.institution || '-'}</div>
                    <div><span className="font-medium">Degree:</span> {edu.degree || '-'}</div>
                    <div><span className="font-medium">Field:</span> {edu.field || '-'}</div>
                    <div><span className="font-medium">Duration:</span> {formatDate(edu.startDate)} - {formatDate(edu.endDate)}</div>
                    {edu.gpa && <div><span className="font-medium">GPA:</span> {edu.gpa}</div>}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No education added yet. Add your first education below.
          </div>
        )}
      </div>

      {/* Add New Education */}
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-4">Add Education</h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="institution">Institution *</Label>
            <Input
              id="institution"
              value={newEdu.institution}
              onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
              placeholder="University name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="degree">Degree *</Label>
            <Input
              id="degree"
              value={newEdu.degree}
              onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
              placeholder="Bachelor's, Master's, PhD, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="field">Field of Study *</Label>
            <Input
              id="field"
              value={newEdu.field}
              onChange={(e) => setNewEdu({ ...newEdu, field: e.target.value })}
              placeholder="Computer Science, Business, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={newEdu.startDate}
                onChange={(e) => setNewEdu({ ...newEdu, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={newEdu.endDate}
                onChange={(e) => setNewEdu({ ...newEdu, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gpa">GPA (Optional)</Label>
            <Input
              id="gpa"
              value={newEdu.gpa}
              onChange={(e) => setNewEdu({ ...newEdu, gpa: e.target.value })}
              placeholder="3.5"
            />
          </div>

          <Button onClick={handleAdd} className="w-full">
            + Add Education
          </Button>
        </div>
      </div>
    </div>
  )
}
