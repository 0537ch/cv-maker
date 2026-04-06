'use client'
import { useState } from 'react'
import { CVData, ProfileField } from '@/types/cv'
import { ExperienceForm } from './sections/ExperienceForm'
import { EducationForm } from './sections/EducationForm'
import { SkillsForm } from './sections/SkillsForm'
import { ChevronDown, ChevronRight, User, Briefcase, GraduationCap, Award, Plus, Trash2 } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@/components/ui/button'

interface CollapsibleTreeEditorProps {
  cvData: CVData
  onChange: (data: CVData) => void
}

export function CollapsibleTreeEditor({ cvData, onChange }: CollapsibleTreeEditorProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['profile']))
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set())
  const [fieldIdCounter, setFieldIdCounter] = useState(0)

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

            {/* Contact Info Fields - always visible, directly editable */}
            {otherFields
              .filter(f => f.type !== 'textarea' && !f.label.includes('Summary') && !f.label.includes('Description'))
              .map(field => (
                <div key={field.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
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
                      <div key={field.id} className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
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
                <div key={field.id} className="space-y-2 border-t pt-3">
                  <div className="flex items-center justify-between gap-2">
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

      {/* Experience Section */}
      <div className="border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('experience')}
          className="w-full flex items-center gap-2 p-3 bg-muted/50 hover:bg-muted/80 transition-colors"
        >
          <HugeiconsIcon icon={expandedSections.has('experience') ? ChevronDown : ChevronRight} size={16} />
          <HugeiconsIcon icon={Briefcase} size={16} />
          <span className="font-semibold">Experience</span>
          <span className="text-xs text-muted-foreground ml-auto">
            {cvData.experience?.length || 0} items
          </span>
        </button>

        {expandedSections.has('experience') && (
          <div className="p-4 border-t">
            <ExperienceForm
              data={cvData.experience || []}
              onChange={(data) => onChange({ ...cvData, experience: data })}
              sectionHeader={cvData.sectionHeaders?.experience}
              onHeaderChange={(value) => onChange({
                ...cvData,
                sectionHeaders: { ...cvData.sectionHeaders, experience: value }
              })}
            />
          </div>
        )}
      </div>

      {/* Education Section */}
      <div className="border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('education')}
          className="w-full flex items-center gap-2 p-3 bg-muted/50 hover:bg-muted/80 transition-colors"
        >
          <HugeiconsIcon icon={expandedSections.has('education') ? ChevronDown : ChevronRight} size={16} />
          <HugeiconsIcon icon={GraduationCap} size={16} />
          <span className="font-semibold">Education</span>
          <span className="text-xs text-muted-foreground ml-auto">
            {cvData.education?.length || 0} items
          </span>
        </button>

        {expandedSections.has('education') && (
          <div className="p-4 border-t">
            <EducationForm
              data={cvData.education || []}
              onChange={(data) => onChange({ ...cvData, education: data })}
              sectionHeader={cvData.sectionHeaders?.education}
              onHeaderChange={(value) => onChange({
                ...cvData,
                sectionHeaders: { ...cvData.sectionHeaders, education: value }
              })}
            />
          </div>
        )}
      </div>

      {/* Skills Section */}
      <div className="border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('skills')}
          className="w-full flex items-center gap-2 p-3 bg-muted/50 hover:bg-muted/80 transition-colors"
        >
          <HugeiconsIcon icon={expandedSections.has('skills') ? ChevronDown : ChevronRight} size={16} />
          <HugeiconsIcon icon={Award} size={16} />
          <span className="font-semibold">Skills</span>
          <span className="text-xs text-muted-foreground ml-auto">
            {cvData.skills?.length || 0} items
          </span>
        </button>

        {expandedSections.has('skills') && (
          <div className="p-4 border-t">
            <SkillsForm
              data={cvData.skills || []}
              onChange={(data) => onChange({ ...cvData, skills: data })}
              sectionHeader={cvData.sectionHeaders?.skills}
              onHeaderChange={(value) => onChange({
                ...cvData,
                sectionHeaders: { ...cvData.sectionHeaders, skills: value }
              })}
            />
          </div>
        )}
      </div>
    </div>
  )
}
