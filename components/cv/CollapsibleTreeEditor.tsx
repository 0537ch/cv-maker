'use client'
import { useState, useMemo, useEffect } from 'react'
import { CVData, ProfileField, CVSection } from '@/types/cv'
import { isLegacyCVData, migrateLegacyToUnified } from '@/lib/cv-utils'
import { SectionRenderer } from './SectionRenderer'
import { ChevronDown, ChevronRight, User, Plus, Trash2, GripVertical } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@/components/ui/button'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'

interface CollapsibleTreeEditorProps {
  cvData: CVData
  onChange: (data: CVData) => void
}

export function CollapsibleTreeEditor({ cvData, onChange }: CollapsibleTreeEditorProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set())
  const [fieldIdCounter, setFieldIdCounter] = useState(0)
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleSectionDragStart = (event: DragStartEvent) => {
    setActiveSectionId(event.active.id as string)
  }

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveSectionId(null)

    if (!over || active.id === over.id) return

    const oldIndex = sortedSections.findIndex(s => s.id === active.id)
    const newIndex = sortedSections.findIndex(s => s.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      // Create new order array with all section IDs
      const newOrder = arrayMove(sortedSections, oldIndex, newIndex).map(s => s.id)

      // Update order property for dynamic sections only
      const dynamicSections = (cvData as CVData & { sections?: CVSection[] }).sections || []
      const updatedDynamicSections = dynamicSections.map(section => {
        const newOrderIndex = newOrder.indexOf(section.id)
        return {
          ...section,
          order: newOrderIndex >= 0 ? newOrderIndex : section.order
        }
      }).sort((a, b) => a.order - b.order)

      // Update cvData with new sectionOrder and updated dynamic sections
      onChange({
        ...cvData,
        sectionOrder: newOrder,
        sections: updatedDynamicSections
      } as CVData)
    }
  }

  // Unified sections derived from cvData (pure computation only)
  const unifiedSections = useMemo<CVSection[]>(() => {
    const dataWithSections = cvData as CVData & { sections?: CVSection[] }
    const dynamicSections = dataWithSections.sections || []

    // Check if legacy sections already exist in dynamic sections
    const dynamicSectionIds = new Set(dynamicSections.map(s => s.id))

    // Only add legacy sections if they don't already exist in dynamic sections
    const legacySections: CVSection[] = []

    // Add experience section only if not already in dynamic sections
    if (cvData.experience && !dynamicSectionIds.has('experience')) {
      legacySections.push({
        id: 'experience',
        type: 'experience',
        label: cvData.sectionHeaders?.experience || 'Experience',
        header: cvData.sectionHeaders?.experience || 'Professional Experience',
        data: cvData.experience as unknown[],
        order: cvData.sectionOrder?.indexOf('experience') ?? 1,
        isCustom: false
      })
    }

    // Add education section only if not already in dynamic sections
    if (cvData.education && !dynamicSectionIds.has('education')) {
      legacySections.push({
        id: 'education',
        type: 'education',
        label: cvData.sectionHeaders?.education || 'Education',
        header: cvData.sectionHeaders?.education || 'Education',
        data: cvData.education as unknown[],
        order: cvData.sectionOrder?.indexOf('education') ?? 2,
        isCustom: false
      })
    }

    // Add skills section only if not already in dynamic sections
    if (cvData.skills && !dynamicSectionIds.has('skills')) {
      legacySections.push({
        id: 'skills',
        type: 'skills',
        label: cvData.sectionHeaders?.skills || 'Skills',
        header: cvData.sectionHeaders?.skills || 'Core Competencies',
        data: cvData.skills as unknown[],
        order: cvData.sectionOrder?.indexOf('skills') ?? 3,
        isCustom: false
      })
    }

    // Combine legacy sections with dynamic sections
    return [...legacySections, ...dynamicSections]
  }, [cvData])

  // Handle migration side-effect (save to database once)
  useEffect(() => {
    const dataWithSections = cvData as CVData & { sections?: CVSection[] }

    // Only migrate if we have legacy data and haven't migrated yet
    if (!dataWithSections.sections && isLegacyCVData(cvData)) {
      const migrated = migrateLegacyToUnified(cvData)
      onChange(migrated as CVData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run once on mount

  const handleSectionChange = (updatedSection: CVSection) => {
    const dataWithSections = cvData as CVData & { sections?: CVSection[] }
    const dynamicSections = dataWithSections.sections || []

    if (['experience', 'education', 'skills'].includes(updatedSection.id)) {
      // Check if the legacy section already exists in dynamic sections
      const existingInDynamic = dynamicSections.find(s => s.id === updatedSection.id)

      let newSections
      if (existingInDynamic) {
        // Update existing section in sections array
        newSections = dynamicSections.map(s =>
          s.id === updatedSection.id ? updatedSection : s
        )
      } else {
        // Add new section to sections array
        newSections = [...dynamicSections, updatedSection]
      }

      // Clear the legacy property to prevent conflicts
      const updatedCvData: CVData = {
        ...cvData,
        sections: newSections
      }

      // Remove the legacy property when saving to unified format
      if (updatedSection.id === 'experience') {
        const { experience: _experience, ...rest } = updatedCvData as unknown as Record<string, unknown>
        onChange(rest as unknown as CVData)
        return
      } else if (updatedSection.id === 'education') {
        const { education: _education, ...rest } = updatedCvData as unknown as Record<string, unknown>
        onChange(rest as unknown as CVData)
        return
      } else if (updatedSection.id === 'skills') {
        const { skills: _skills, ...rest } = updatedCvData as unknown as Record<string, unknown>
        onChange(rest as unknown as CVData)
        return
      }

      onChange(updatedCvData)
    } else {
      // Handle dynamic sections - update in sections array
      const newSections = dynamicSections.map(s =>
        s.id === updatedSection.id ? updatedSection : s
      )
      onChange({
        ...cvData,
        sections: newSections
      } as CVData)
    }
  }

  const handleSectionDelete = (sectionId: string) => {
    const newSections = unifiedSections.filter(s => s.id !== sectionId)
    onChange({
      ...cvData,
      sections: newSections
    } as CVData)
  }

  // Sort sections by sectionOrder (if available) or by order property
  const sortedSections = [...unifiedSections].sort((a, b) => {
    // If we have a sectionOrder array, use it to determine relative order
    if (cvData.sectionOrder && Array.isArray(cvData.sectionOrder)) {
      const aIndex = cvData.sectionOrder.indexOf(a.id)
      const bIndex = cvData.sectionOrder.indexOf(b.id)

      // If both sections are in sectionOrder, use their positions
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex
      }

      // If only one is in sectionOrder, it comes first
      if (aIndex !== -1) return -1
      if (bIndex !== -1) return 1
    }

    // Fall back to order property
    return a.order - b.order
  })

  // Sortable section wrapper component
  const SortableSectionWrapper = ({ section, onChange, onDelete, isExpanded, onToggle }: {
    section: CVSection
    onChange: (section: CVSection) => void
    onDelete?: () => void
    isExpanded: boolean
    onToggle: () => void
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging
    } = useSortable({ id: section.id })

    const style = {
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      transition,
      opacity: isDragging ? 0.5 : 1
    }

    return (
      <div ref={setNodeRef} style={style}>
        <div className="flex items-center gap-1 mb-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          >
            <HugeiconsIcon icon={GripVertical} size={14} className="text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground flex-1">
            Drag to reorder
          </span>
        </div>
        <SectionRenderer
          section={section}
          onChange={onChange}
          onDelete={onDelete}
          isExpanded={isExpanded}
          onToggle={onToggle}
        />
      </div>
    )
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  const toggleField = (fieldId: string) => {
    setExpandedFields(prev => {
      const next = new Set(prev)
      if (next.has(fieldId)) {
        next.delete(fieldId)
      } else {
        next.add(fieldId)
      }
      return next
    })
  }

  const handleFieldDragStart = (e: React.DragEvent, fieldId: string) => {
    setDraggedFieldId(fieldId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleFieldDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleFieldDrop = (e: React.DragEvent, dropId: string) => {
    e.preventDefault()
    if (!draggedFieldId || draggedFieldId === dropId) return

    const profileFields: ProfileField[] = (cvData.personalInfo as { fields?: ProfileField[] }).fields || []
    const draggedIndex = profileFields.findIndex(f => f.id === draggedFieldId)
    const dropIndex = profileFields.findIndex(f => f.id === dropId)

    if (draggedIndex === -1 || dropIndex === -1) return

    const newFields = [...profileFields]
    const [removed] = newFields.splice(draggedIndex, 1)
    newFields.splice(dropIndex, 0, removed)

    // Update order property for all fields
    newFields.forEach((field, idx) => {
      field.order = idx
    })

    onChange({
      ...cvData,
      personalInfo: { fields: newFields }
    })
    setDraggedFieldId(null)
  }

  const handleFieldDragEnd = () => {
    setDraggedFieldId(null)
  }

  const handleFieldChange = (fieldId: string, updates: Partial<ProfileField>) => {
    const profileFields: ProfileField[] = (cvData.personalInfo as { fields?: ProfileField[] }).fields || []
    const updatedFields = profileFields.map(field =>
      field.id === fieldId ? { ...field, ...updates } : field
    )
    onChange({
      ...cvData,
      personalInfo: { fields: updatedFields }
    })
  }

  const profileFields: ProfileField[] = (cvData.personalInfo as { fields?: ProfileField[] }).fields || []
  // Find name field - very permissive search
  const nameField = profileFields.find(f => {
    const labelLower = f.label.toLowerCase()
    const idLower = f.id.toLowerCase()
    return (
      idLower === 'full-name' ||
      idLower === 'name' ||
      labelLower === 'full name' ||
      labelLower === 'name' ||
      labelLower.includes('name') ||
      f.order === 0 // First field is often the name
    )
  })
  const otherFields = profileFields.filter(f => {
    const labelLower = f.label.toLowerCase()
    const idLower = f.id.toLowerCase()
    return (
      idLower !== 'full-name' &&
      idLower !== 'name' &&
      !labelLower.includes('name')
    )
  })

  return (
    <div className="space-y-2">
      {/* Profile Section */}
      <div className="border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('profile')}
          className="w-full flex items-center gap-2 p-3 bg-muted/50 hover:bg-muted/80 transition-colors"
        >
          <HugeiconsIcon icon={expandedSections.has('profile') ? ChevronDown : ChevronRight} size={16} />
          <HugeiconsIcon icon={User} size={16} />
          <span className="font-semibold">Profile</span>
          <span className="text-xs text-muted-foreground ml-auto">
            {profileFields.length} fields
          </span>
        </button>

        {expandedSections.has('profile') && (
          <div className="p-4 space-y-4 border-t">
            {/* Name Field - Always show if exists, always editable */}
            {nameField ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={nameField.label}
                  onChange={(e) => handleFieldChange(nameField.id, { label: e.target.value })}
                  className="text-sm font-medium px-2 py-1 border rounded-md bg-background w-full"
                  placeholder="Field label"
                />
                <input
                  type={nameField.type}
                  value={nameField.value}
                  onChange={(e) => handleFieldChange(nameField.id, { value: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  placeholder={nameField.label}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
                  No name field found.
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newNameField: ProfileField = {
                      id: `full-name-${fieldIdCounter}`,
                      label: 'Full Name',
                      value: '',
                      type: 'text',
                      required: true,
                      section: 'custom',
                      order: 0
                    }
                    setFieldIdCounter(prev => prev + 1)
                    onChange({
                      ...cvData,
                      personalInfo: { fields: [newNameField, ...profileFields] }
                    })
                  }}
                >
                  <HugeiconsIcon icon={Plus} size={14} className="mr-2" />
                  Add Name Field
                </Button>
              </div>
            )}

            {otherFields
              .filter(f =>
                f.type !== 'textarea' &&
                !f.label.includes('Summary') &&
                !f.label.includes('Description') &&
                !f.label.toLowerCase().includes('linkedin') &&
                !f.label.toLowerCase().includes('github') &&
                !f.label.toLowerCase().includes('twitter') &&
                !f.label.toLowerCase().includes('website') &&
                !f.label.toLowerCase().includes('portfolio')
              )
              .map(field => (
                <div
                  key={field.id}
                  draggable
                  onDragStart={(e) => handleFieldDragStart(e, field.id)}
                  onDragOver={handleFieldDragOver}
                  onDrop={(e) => handleFieldDrop(e, field.id)}
                  onDragEnd={handleFieldDragEnd}
                  className={`space-y-2 border rounded-lg p-3 transition-all ${
                    draggedFieldId === field.id ? 'opacity-50 ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="cursor-grab active:cursor-grabbing shrink-0">
                      <HugeiconsIcon icon={GripVertical} size={14} className="text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => handleFieldChange(field.id, { label: e.target.value })}
                      className="text-sm font-medium px-2 py-1 border rounded-md bg-background flex-1"
                      placeholder="Field label"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const updatedFields = profileFields.filter(f => f.id !== field.id)
                        onChange({ ...cvData, personalInfo: { fields: updatedFields } })
                      }}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <HugeiconsIcon icon={Trash2} size={14} />
                    </Button>
                  </div>
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.id, { value: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    placeholder={field.label}
                  />
                </div>
              ))}

            {/* Social Links Section - expandable with add/remove */}
            <div className="border rounded-md overflow-hidden">
              <button
                onClick={() => toggleField('socials')}
                className="w-full flex items-center gap-2 p-2 bg-background hover:bg-muted/50 transition-colors text-left"
              >
                <HugeiconsIcon icon={expandedFields.has('socials') ? ChevronDown : ChevronRight} size={14} />
                <span className="text-sm font-medium">Social Links</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {otherFields.filter(f =>
                    f.label.toLowerCase().includes('linkedin') ||
                    f.label.toLowerCase().includes('github') ||
                    f.label.toLowerCase().includes('twitter') ||
                    f.label.toLowerCase().includes('website') ||
                    f.label.toLowerCase().includes('portfolio')
                  ).length} links
                </span>
              </button>
              {expandedFields.has('socials') && (
                <div className="p-3 border-t space-y-3">
                  {otherFields
                    .filter(f =>
                      f.label.toLowerCase().includes('linkedin') ||
                      f.label.toLowerCase().includes('github') ||
                      f.label.toLowerCase().includes('twitter') ||
                      f.label.toLowerCase().includes('website') ||
                      f.label.toLowerCase().includes('portfolio')
                    )
                    .map(field => (
                      <div
                        key={field.id}
                        draggable
                        onDragStart={(e) => handleFieldDragStart(e, field.id)}
                        onDragOver={handleFieldDragOver}
                        onDrop={(e) => handleFieldDrop(e, field.id)}
                        onDragEnd={handleFieldDragEnd}
                        className={`space-y-2 border rounded-md p-2 transition-all ${
                          draggedFieldId === field.id ? 'opacity-50 ring-2 ring-primary' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="cursor-grab active:cursor-grabbing shrink-0">
                            <HugeiconsIcon icon={GripVertical} size={12} className="text-muted-foreground" />
                          </div>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => handleFieldChange(field.id, { label: e.target.value })}
                            className="text-xs font-medium px-2 py-1 border rounded-md bg-background flex-1"
                            placeholder="Link label"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updatedFields = profileFields.filter(f => f.id !== field.id)
                              onChange({ ...cvData, personalInfo: { fields: updatedFields } })
                            }}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <HugeiconsIcon icon={Trash2} size={14} />
                          </Button>
                        </div>
                        <input
                          type={field.type}
                          value={field.value}
                          onChange={(e) => handleFieldChange(field.id, { value: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                          placeholder={field.label}
                        />
                      </div>
                    ))}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const socialLinks = ['LinkedIn', 'GitHub', 'Twitter', 'Website', 'Portfolio']
                      const existingSocials = otherFields.filter(f =>
                        f.label.toLowerCase().includes('linkedin') ||
                        f.label.toLowerCase().includes('github') ||
                        f.label.toLowerCase().includes('twitter') ||
                        f.label.toLowerCase().includes('website') ||
                        f.label.toLowerCase().includes('portfolio')
                      )

                      const availableSocial = socialLinks.find(
                        social => !existingSocials.some(f => f.label.toLowerCase() === social.toLowerCase())
                      )

                      if (availableSocial) {
                        const newField: ProfileField = {
                          id: `social-${fieldIdCounter}`,
                          label: availableSocial,
                          value: '',
                          type: 'url',
                          required: false,
                          section: 'custom',
                          order: profileFields.length
                        }
                        setFieldIdCounter(prev => prev + 1)
                        onChange({
                          ...cvData,
                          personalInfo: { fields: [...profileFields, newField] }
                        })
                      }
                    }}
                  >
                    <HugeiconsIcon icon={Plus} size={14} className="mr-2" />
                    Add Social Link
                  </Button>
                </div>
              )}
            </div>

            {/* Summary/Description Fields - always visible */}
            {otherFields
              .filter(f => f.type === 'textarea' || f.label.includes('Summary') || f.label.includes('Description'))
              .map(field => (
                <div
                  key={field.id}
                  draggable
                  onDragStart={(e) => handleFieldDragStart(e, field.id)}
                  onDragOver={handleFieldDragOver}
                  onDrop={(e) => handleFieldDrop(e, field.id)}
                  onDragEnd={handleFieldDragEnd}
                  className={`space-y-2 border-t pt-3 transition-all ${
                    draggedFieldId === field.id ? 'opacity-50 ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="cursor-grab active:cursor-grabbing shrink-0">
                      <HugeiconsIcon icon={GripVertical} size={14} className="text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => handleFieldChange(field.id, { label: e.target.value })}
                      className="text-sm font-semibold px-2 py-1 border rounded-md bg-background flex-1"
                      placeholder="Section title"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const updatedFields = profileFields.filter(f => f.id !== field.id)
                        onChange({ ...cvData, personalInfo: { fields: updatedFields } })
                      }}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <HugeiconsIcon icon={Trash2} size={14} />
                    </Button>
                  </div>
                  <textarea
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.id, { value: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm min-h-30 focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder={`Write your ${field.label.toLowerCase()} here...`}
                  />
                  <p className="text-xs text-muted-foreground">
                    Click inside the text area above to edit your {field.label.toLowerCase()}
                  </p>
                </div>
              ))}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                const newField: ProfileField = {
                  id: `custom-${fieldIdCounter}`,
                  label: 'Custom Field',
                  value: '',
                  type: 'text',
                  required: false,
                  section: 'custom',
                  order: profileFields.length
                }
                setFieldIdCounter(prev => prev + 1)
                onChange({
                  ...cvData,
                  personalInfo: { fields: [...profileFields, newField] }
                })
              }}
            >
              <HugeiconsIcon icon={Plus} size={14} className="mr-2" />
              Add Custom Field
            </Button>
          </div>
        )}
      </div>

      {/* Dynamic Sections - Including legacy sections (Experience, Education, Skills) for unified reordering */}
      {sortedSections.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleSectionDragStart}
          onDragEnd={handleSectionDragEnd}
        >
          <SortableContext
            items={sortedSections.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sortedSections.map(section => (
                <SortableSectionWrapper
                  key={section.id}
                  section={section}
                  onChange={handleSectionChange}
                  onDelete={section.isCustom ? () => handleSectionDelete(section.id) : undefined}
                  isExpanded={expandedSections.has(section.id)}
                  onToggle={() => toggleSection(section.id)}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeSectionId ? (
              <div className="opacity-50">
                <SectionRenderer
                  section={sortedSections.find(s => s.id === activeSectionId)!}
                  onChange={() => {}}
                  isExpanded={false}
                  onToggle={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  )
}
