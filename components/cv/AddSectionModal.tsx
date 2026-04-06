'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { SECTION_REGISTRY } from '@/lib/section-registry'
import { HugeiconsIcon } from '@hugeicons/react'
import { Plus, Cancel01Icon } from '@hugeicons/core-free-icons'
import { FieldConfig } from '@/types/cv'
import { createPortal } from 'react-dom'

interface AddSectionModalProps {
  open: boolean
  onClose: () => void
  onAddSection: (type: string, config?: { label?: string; fieldConfig?: FieldConfig[] }) => void
}

export function AddSectionModal({ open, onClose, onAddSection }: AddSectionModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [step, setStep] = useState<'select' | 'configure'>('select')

  const handleClose = useCallback(() => {
    setSelectedType(null)
    setStep('select')
    onClose()
  }, [onClose])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [open])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, handleClose])

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

  return (
    <>
      {open && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ height: '100dvh' }}
        >
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <div
            className="relative z-50 w-full max-w-lg bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-2xl max-h-[90dvh] overflow-y-auto"
            style={{ overscrollBehavior: 'contain' }}
          >
            {/* Close Button - 44px touch target */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 -m-2 text-muted-foreground hover:text-white transition-colors touch-manipulation"
              aria-label="Close modal"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={20} />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 id="modal-title" className="text-lg font-semibold bg-linear-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Add New Section
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Choose a section type to add to your CV
              </p>
            </div>

            {/* Content */}
            {step === 'select' && (
              <div className="space-y-2 max-h-96 overflow-y-auto -mx-2 px-2">
                {predefinedSections.map(section => (
                  <Button
                    key={section.id}
                    variant="outline"
                    className="w-full justify-start h-auto py-3
                               bg-slate-900/40 backdrop-blur-sm border-cyan-500/20
                               hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/10
                               hover:border-cyan-500/40 hover:bg-slate-900/60
                               transition-all duration-200 group touch-manipulation"
                    onClick={() => handleSelect(section.id)}
                  >
                    <HugeiconsIcon icon={section.icon} size={18} className="mr-3 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0" />
                    <div className="text-left min-w-0 flex-1">
                      <div className="font-medium truncate">{section.label}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {section.defaultHeader}
                      </div>
                    </div>
                  </Button>
                ))}

                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3
                             bg-slate-900/40 backdrop-blur-sm border-cyan-500/20
                             hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/10
                             hover:border-cyan-500/40 hover:bg-slate-900/60
                             transition-all duration-200 group touch-manipulation"
                  onClick={() => handleSelect('custom')}
                >
                  <HugeiconsIcon icon={Plus} size={18} className="mr-3 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0" />
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-medium truncate">Custom Section</div>
                    <div className="text-xs text-muted-foreground truncate">
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
          </div>
        </div>,
        document.body
      )}
    </>
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
        <label className="text-sm font-medium text-slate-300">Section Label</label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full px-3 py-2 border rounded-md mt-1
                     bg-slate-900/40 backdrop-blur-sm border-cyan-500/20
                     focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
                     text-white placeholder:text-slate-500
                     transition-all duration-200"
          placeholder="e.g., Awards, Publications, Languages"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-300">Choose Template (Optional)</label>
        <select
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="w-full h-9 px-3 py-2 border rounded-md mt-1
                     bg-slate-900/40 backdrop-blur-sm border-cyan-500/20
                     focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
                     text-white
                     transition-all duration-200"
        >
          <option value="">Start from scratch</option>
          {templates.map(t => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-500/40
                     hover:scale-105 transition-all duration-200"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!label}
          className="bg-linear-to-r from-cyan-500 to-teal-500
                     hover:from-cyan-600 hover:to-teal-600
                     hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25
                     transition-all duration-200 disabled:opacity-50"
        >
          Add Section
        </Button>
      </div>
    </div>
  )
}
