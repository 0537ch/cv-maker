'use client'
import { Skill } from '@/types/cv'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { GripVertical, Trash2, Pencil } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export function SkillsForm({
  data,
  onChange,
  sectionHeader,
  onHeaderChange
}: {
  data: Skill[]
  onChange: (data: Skill[]) => void
  sectionHeader?: string
  onHeaderChange?: (header: string) => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Skill>({
    id: '',
    name: '',
    level: 'intermediate',
    category: ''
  })
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const startEdit = (skill: Skill) => {
    setEditingId(skill.id)
    setEditForm(skill)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({
      id: '',
      name: '',
      level: 'intermediate',
      category: ''
    })
  }

  const saveEdit = () => {
    if (!editingId) return
    onChange(data.map(skill => skill.id === editingId ? editForm : skill))
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    onChange(data.filter(skill => skill.id !== id))
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

    const draggedIndex = data.findIndex(skill => skill.id === draggedId)
    const dropIndex = data.findIndex(skill => skill.id === dropId)

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

  const defaultHeader = 'Core Competencies'
  const [itemIdCounter, setItemIdCounter] = useState(0)

  const [newSkill, setNewSkill] = useState<Skill>({
    id: '',
    name: '',
    level: 'intermediate',
    category: ''
  })

  const handleAdd = () => {
    if (!newSkill.name || !newSkill.category) return

    onChange([
      ...data,
      { ...newSkill, id: `skill-${itemIdCounter}` }
    ])

    setItemIdCounter(prev => prev + 1)
    setNewSkill({
      id: '',
      name: '',
      level: 'intermediate',
      category: ''
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
            placeholder="Core Competencies"
          />
          <p className="text-xs text-muted-foreground">
            Customize the section title that appears on your CV
          </p>
        </div>
      )}

      {/* Skills List */}
      <div className="space-y-2">
        {data.map((skill) => (
          <div
            key={skill.id}
            draggable
            onDragStart={(e) => handleDragStart(e, skill.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, skill.id)}
            onDragEnd={handleDragEnd}
            className={`border rounded-lg overflow-hidden transition-all ${
              draggedId === skill.id ? 'opacity-50 ring-2 ring-primary' : ''
            }`}
          >
            {editingId === skill.id ? (
              // Edit Mode
              <div className="p-3 space-y-3 bg-muted/30">
                <div className="space-y-2">
                  <Label>Skill Name</Label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="JavaScript, React, Python..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    placeholder="Programming, Design, Language..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Proficiency Level</Label>
                  <div className="flex gap-2">
                    {['beginner', 'intermediate', 'expert'].map((level) => (
                      <Button
                        key={level}
                        type="button"
                        variant={editForm.level === level ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setEditForm({ ...editForm, level: level as Skill['level'] })}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Button>
                    ))}
                  </div>
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
              <div className="flex items-center gap-2 p-3 bg-background hover:bg-muted/50 transition-colors">
                <div className="cursor-grab active:cursor-grabbing">
                  <HugeiconsIcon icon={GripVertical} size={16} className="text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-xs text-muted-foreground">({skill.level})</span>
                  <span className="text-xs text-muted-foreground">• {skill.category}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 min-h-[44px] min-w-[44px]"
                  onClick={() => startEdit(skill)}
                >
                  <HugeiconsIcon icon={Pencil} size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 min-h-[44px] min-w-[44px] text-muted-foreground hover:text-destructive hover:bg-destructive/20"
                  onClick={() => handleDelete(skill.id)}
                >
                  <HugeiconsIcon icon={Trash2} size={16} />
                </Button>
              </div>
            )}
          </div>
        ))}

        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No skills added yet. Add your first skill below.
          </div>
        )}
      </div>

      {/* Add New Skill */}
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-4">Add Skill</h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="skillName">Skill Name *</Label>
            <Input
              id="skillName"
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              placeholder="JavaScript, React, Python..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Input
              id="category"
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
              placeholder="Programming, Design, Language..."
            />
          </div>

          <div className="space-y-2">
            <Label>Proficiency Level *</Label>
            <div className="flex gap-2">
              {['beginner', 'intermediate', 'expert'].map((level) => (
                <Button
                  key={level}
                  type="button"
                  variant={newSkill.level === level ? 'default' : 'outline'}
                  onClick={() => setNewSkill({ ...newSkill, level: level as Skill['level'] })}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={handleAdd} className="w-full">
            + Add Skill
          </Button>
        </div>
      </div>
    </div>
  )
}
