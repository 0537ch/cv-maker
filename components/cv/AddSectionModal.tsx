'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SECTION_REGISTRY } from '@/lib/section-registry'
import { HugeiconsIcon } from '@hugeicons/react'
import { Plus } from '@hugeicons/core-free-icons'
import { FieldConfig } from '@/types/cv'

interface AddSectionModalProps {
  open: boolean
  onClose: () => void
  onAddSection: (type: string, config?: { label?: string; fieldConfig?: FieldConfig[] }) => void
}

export function AddSectionModal({ open, onClose, onAddSection }: AddSectionModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [step, setStep] = useState<'select' | 'configure'>('select')

  const predefinedSections = Object.values(SECTION_REGISTRY).filter(s => s.isPredefined)

  const handleSelect = (type: string) => {
    if (type === 'custom') {
      setSelectedType('custom')
      setStep('configure')
    } else {
      onAddSection(type)
      handleClose()
    }
  }

  const handleClose = () => {
    setSelectedType(null)
    setStep('select')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Section</DialogTitle>
          <DialogDescription>
            Choose a section type to add to your CV
          </DialogDescription>
        </DialogHeader>

        {step === 'select' && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {predefinedSections.map(section => (
              <Button
                key={section.id}
                variant="outline"
                className="w-full justify-start h-auto py-3"
                onClick={() => handleSelect(section.id)}
              >
                <HugeiconsIcon icon={section.icon} size={18} className="mr-3" />
                <div className="text-left">
                  <div className="font-medium">{section.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {section.defaultHeader}
                  </div>
                </div>
              </Button>
            ))}

            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3"
              onClick={() => handleSelect('custom')}
            >
              <HugeiconsIcon icon={Plus} size={18} className="mr-3" />
              <div className="text-left">
                <div className="font-medium">Custom Section</div>
                <div className="text-xs text-muted-foreground">
                  Create your own section type
                </div>
              </div>
            </Button>
          </div>
        )}

        {step === 'configure' && selectedType === 'custom' && (
          <CustomSectionConfigForm
            onSubmit={(config) => {
              onAddSection('custom', config)
              handleClose()
            }}
            onCancel={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface CustomSectionConfigFormProps {
  onSubmit: (config: { label: string; fieldConfig: FieldConfig[] }) => void
  onCancel: () => void
}

function CustomSectionConfigForm({ onSubmit, onCancel }: CustomSectionConfigFormProps) {
  const [label, setLabel] = useState('')
  const [template, setTemplate] = useState<string>('')

  const templates = [
    {
      id: 'award',
      label: 'Award / Honor',
      fields: [
        { id: 'title', label: 'Award Name', type: 'text' as const, required: true, order: 0 },
        { id: 'issuer', label: 'Issued By', type: 'text' as const, required: true, order: 1 },
        { id: 'date', label: 'Date', type: 'date' as const, required: true, order: 2 },
        { id: 'description', label: 'Description', type: 'textarea' as const, required: false, order: 3 }
      ]
    },
    {
      id: 'publication',
      label: 'Publication',
      fields: [
        { id: 'title', label: 'Title', type: 'text' as const, required: true, order: 0 },
        { id: 'publisher', label: 'Publisher/Journal', type: 'text' as const, required: true, order: 1 },
        { id: 'date', label: 'Publication Date', type: 'date' as const, required: true, order: 2 },
        { id: 'url', label: 'URL/DOI', type: 'url' as const, required: false, order: 3 }
      ]
    },
    {
      id: 'language',
      label: 'Language',
      fields: [
        { id: 'language', label: 'Language', type: 'text' as const, required: true, order: 0 },
        { id: 'proficiency', label: 'Proficiency Level', type: 'text' as const, required: true, order: 1 },
        { id: 'certificate', label: 'Certificate URL', type: 'url' as const, required: false, order: 2 }
      ]
    },
    {
      id: 'volunteer',
      label: 'Volunteer Experience',
      fields: [
        { id: 'organization', label: 'Organization', type: 'text' as const, required: true, order: 0 },
        { id: 'role', label: 'Role', type: 'text' as const, required: true, order: 1 },
        { id: 'startDate', label: 'Start Date', type: 'date' as const, required: true, order: 2 },
        { id: 'endDate', label: 'End Date', type: 'date' as const, required: false, order: 3 },
        { id: 'description', label: 'Description', type: 'textarea' as const, required: false, order: 4 }
      ]
    },
    {
      id: 'patent',
      label: 'Patent',
      fields: [
        { id: 'title', label: 'Patent Title', type: 'text' as const, required: true, order: 0 },
        { id: 'number', label: 'Patent Number', type: 'text' as const, required: true, order: 1 },
        { id: 'date', label: 'Issue Date', type: 'date' as const, required: true, order: 2 },
        { id: 'url', label: 'Patent URL', type: 'url' as const, required: false, order: 3 }
      ]
    }
  ]

  const handleSubmit = () => {
    const selectedTemplate = templates.find(t => t.id === template)

    // If starting from scratch, provide a default textarea field
    const defaultFieldConfig: FieldConfig[] = [
      {
        id: 'content',
        label: 'Content',
        type: 'textarea',
        required: false,
        order: 0
      }
    ]

    onSubmit({
      label,
      fieldConfig: selectedTemplate?.fields || defaultFieldConfig
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Section Label</label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full px-3 py-2 border rounded-md mt-1"
          placeholder="e.g., Awards, Publications, Languages"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Choose Template (Optional)</label>
        <select
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="w-full px-3 py-2 border rounded-md mt-1"
        >
          <option value="">Start from scratch</option>
          {templates.map(t => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!label}>
          Add Section
        </Button>
      </div>
    </div>
  )
}
