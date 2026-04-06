'use client'
import { ProfileField } from '@/types/cv'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, GripVertical } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { v4 as uuidv4 } from 'uuid'

interface DynamicProfileFormProps {
  fields: ProfileField[]
  onChange: (fields: ProfileField[]) => void
  sectionHeader?: string
  onHeaderChange?: (header: string) => void
}

export function DynamicProfileForm({ fields, onChange, sectionHeader, onHeaderChange }: DynamicProfileFormProps) {
  const addField = () => {
    const newField: ProfileField = {
      id: uuidv4(),
      label: 'New Field',
      value: '',
      type: 'text',
      required: false,
      section: 'custom',
      order: fields.length
    }
    onChange([...fields, newField])
  }

  const removeField = (fieldId: string) => {
    onChange(fields.filter(f => f.id !== fieldId))
  }

  const updateField = (fieldId: string, updates: Partial<ProfileField>) => {
    onChange(fields.map(f =>
      f.id === fieldId ? { ...f, ...updates } : f
    ))
  }

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const index = fields.findIndex(f => f.id === fieldId)
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === fields.length - 1)
    ) {
      return
    }

    const newFields = [...fields]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]]

    // Update order
    newFields.forEach((field, idx) => {
      field.order = idx
    })

    onChange(newFields)
  }

  const renderField = (field: ProfileField, index: number) => {
    return (
      <div key={field.id}
           className="flex items-start gap-2 group
                  border border-cyan-500/20 p-4 rounded-lg
                  bg-slate-900/40 backdrop-blur-sm
                  hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10
                  transition-all duration-200">
        <div className="flex flex-col gap-1 mt-2">
          <HugeiconsIcon
            icon={GripVertical}
            className="h-4 w-4 text-muted-foreground cursor-move"
          />
        </div>
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-slate-300">Field Label</Label>
              <Input
                value={field.label}
                onChange={(e) => updateField(field.id, { label: e.target.value })}
                placeholder="e.g., Email, Phone, GitHub"
                className="min-h-12 bg-slate-900/40 backdrop-blur-sm border-cyan-500/20
                           focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
                           text-white placeholder:text-slate-500
                           transition-all duration-200"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300">Field Type</Label>
              <select
                value={field.type}
                onChange={(e) => updateField(field.id, { type: e.target.value as ProfileField['type'] })}
                className="min-h-12 w-full px-3 rounded-md border
                           bg-slate-900/40 backdrop-blur-sm border-cyan-500/20
                           focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
                           text-white
                           transition-all duration-200"
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="tel">Phone</option>
                <option value="url">URL</option>
                <option value="textarea">Text Area</option>
                <option value="date">Date</option>
                <option value="number">Number</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-slate-300">Value</Label>
            {field.type === 'textarea' ? (
              <Textarea
                value={field.value}
                onChange={(e) => updateField(field.id, { value: e.target.value })}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                rows={3}
                className="min-h-32 resize-none bg-slate-900/40 backdrop-blur-sm
                           border-cyan-500/20 focus:border-cyan-500/50
                           focus:ring-2 focus:ring-cyan-500/20
                           text-white placeholder:text-slate-500
                           transition-all duration-200"
              />
            ) : (
              <Input
                type={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : field.type === 'url' ? 'url' : 'text'}
                value={field.value}
                onChange={(e) => updateField(field.id, { value: e.target.value })}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                className="min-h-12 bg-slate-900/40 backdrop-blur-sm border-cyan-500/20
                           focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
                           text-white placeholder:text-slate-500
                           transition-all duration-200"
              />
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(field.id, { required: e.target.checked })}
                  className="h-4 w-4 accent-cyan-500"
                />
                Required
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveField(field.id, 'up')}
                disabled={index === 0}
                className="min-h-[44px] min-w-[44px] hover:bg-cyan-500/10 hover:scale-105 transition-all duration-200"
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveField(field.id, 'down')}
                disabled={index === fields.length - 1}
                className="min-h-[44px] min-w-[44px] hover:bg-cyan-500/10 hover:scale-105 transition-all duration-200"
              >
                ↓
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="min-h-[44px] min-w-[44px] text-destructive hover:text-destructive
                           hover:bg-destructive/20 hover:scale-105
                           transition-all duration-200"
                onClick={() => removeField(field.id)}
              >
                <HugeiconsIcon icon={Trash2} className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section Header Customization */}
      {onHeaderChange && (
        <div className="space-y-2 pb-4 border-b border-cyan-500/20">
          <Label htmlFor="sectionHeader" className="text-slate-300">Section Header</Label>
          <Input
            id="sectionHeader"
            value={sectionHeader || 'Profile'}
            onChange={(e) => onHeaderChange(e.target.value)}
            placeholder="Profile"
            className="min-h-12 bg-slate-900/40 backdrop-blur-sm border-cyan-500/20
                       focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
                       text-white placeholder:text-slate-500
                       transition-all duration-200"
          />
          <p className="text-xs text-muted-foreground">
            Customize the section title that appears on your CV
          </p>
        </div>
      )}

      {/* Add Field Button */}
      <Button
        variant="outline"
        className="w-full border-cyan-500/30 hover:bg-cyan-500/10
                   hover:border-cyan-500/40 hover:scale-105
                   transition-all duration-200"
        onClick={addField}
      >
        <HugeiconsIcon icon={Plus} className="h-4 w-4 mr-2" />
        Add Field
      </Button>

      {/* Fields List */}
      <div className="space-y-3">
        {fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground
                          border-2 border-dashed border-cyan-500/20 rounded-lg
                          bg-slate-900/20 backdrop-blur-sm">
            <p className="text-sm">No fields yet. Click &quot;Add Field&quot; to create your first field.</p>
          </div>
        ) : (
          fields.map((field, index) => renderField(field, index))
        )}
      </div>
    </div>
  )
}
