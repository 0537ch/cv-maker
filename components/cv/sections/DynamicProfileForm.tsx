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
      <div key={field.id} className="flex items-start gap-2 group border p-4 rounded-lg">
        <div className="flex flex-col gap-1 mt-2">
          <HugeiconsIcon
            icon={GripVertical}
            className="h-4 w-4 text-muted-foreground cursor-move"
          />
        </div>
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Field Label</Label>
              <Input
                value={field.label}
                onChange={(e) => updateField(field.id, { label: e.target.value })}
                placeholder="e.g., Email, Phone, GitHub"
              />
            </div>
            <div className="space-y-1">
              <Label>Field Type</Label>
              <select
                value={field.type}
                onChange={(e) => updateField(field.id, { type: e.target.value as ProfileField['type'] })}
                className="w-full h-9 px-3 rounded-md border bg-background text-sm"
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
            <Label>Value</Label>
            {field.type === 'textarea' ? (
              <Textarea
                value={field.value}
                onChange={(e) => updateField(field.id, { value: e.target.value })}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                rows={3}
                className="resize-none"
              />
            ) : (
              <Input
                type={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : field.type === 'url' ? 'url' : 'text'}
                value={field.value}
                onChange={(e) => updateField(field.id, { value: e.target.value })}
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(field.id, { required: e.target.checked })}
                  className="h-4 w-4"
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
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveField(field.id, 'down')}
                disabled={index === fields.length - 1}
              >
                ↓
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
        <div className="space-y-2 pb-4 border-b">
          <Label htmlFor="sectionHeader">Section Header</Label>
          <Input
            id="sectionHeader"
            value={sectionHeader || 'Profile'}
            onChange={(e) => onHeaderChange(e.target.value)}
            placeholder="Profile"
          />
          <p className="text-xs text-muted-foreground">
            Customize the section title that appears on your CV
          </p>
        </div>
      )}

      {/* Add Field Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={addField}
      >
        <HugeiconsIcon icon={Plus} className="h-4 w-4 mr-2" />
        Add Field
      </Button>

      {/* Fields List */}
      <div className="space-y-3">
        {fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <p className="text-sm">No fields yet. Click &quot;Add Field&quot; to create your first field.</p>
          </div>
        ) : (
          fields.map((field, index) => renderField(field, index))
        )}
      </div>
    </div>
  )
}
