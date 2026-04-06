import { CVData, ProfileField, PersonalInfo, CVSection, FieldConfig, Experience, Skill, Education } from '@/types/cv'
import { Card } from '@/components/ui/card'

type PersonalInfoWithFields = PersonalInfo & { fields: ProfileField[] }

interface OrderedSection {
  id: string
  type: string
  data: unknown[]
  header: string
  label: string
}

export function ATSTemplate({ data }: { data: CVData }) {
  // Helper to get section data from unified sections only - NO fallback
  const getSectionData = (sectionId: string): unknown[] => {
    const dataWithSections = data as CVData & { sections?: CVSection[] }
    if (dataWithSections.sections && Array.isArray(dataWithSections.sections)) {
      const section = dataWithSections.sections.find(s => s.id === sectionId)
      return section?.data || []
    }

    // No fallback - return empty array if sections don't exist
    return []
  }

  const getSectionHeader = (sectionId: string, defaultHeader: string): string => {
    const dataWithSections = data as CVData & { sections?: CVSection[] }
    if (dataWithSections.sections && Array.isArray(dataWithSections.sections)) {
      const section = dataWithSections.sections.find(s => s.id === sectionId)
      return section?.header || defaultHeader
    }

    // No fallback - return default header
    return defaultHeader
  }

  // Helper to get all sections (legacy + dynamic) sorted by sectionOrder
  const getAllSectionsInOrder = (): OrderedSection[] => {
    const dataWithSections = data as CVData & { sections?: CVSection[] }
    const dynamicSections = dataWithSections.sections || []

    // Build unified section list
    const allSections: OrderedSection[] = [
      {
        id: 'skills',
        type: 'skills',
        data: getSectionData('skills'),
        header: getSectionHeader('skills', 'CORE COMPETENCIES'),
        label: 'Skills'
      },
      {
        id: 'experience',
        type: 'experience',
        data: getSectionData('experience'),
        header: getSectionHeader('experience', 'PROFESSIONAL EXPERIENCE'),
        label: 'Experience'
      },
      {
        id: 'education',
        type: 'education',
        data: getSectionData('education'),
        header: getSectionHeader('education', 'EDUCATION'),
        label: 'Education'
      },
      ...dynamicSections
        .filter(section => !['skills', 'experience', 'education'].includes(section.id))
        .map(section => ({
          id: section.id,
          type: section.type,
          data: section.data,
          header: section.header || section.label,
          label: section.label
        }))
    ]

    // Sort by sectionOrder if available
    if (data.sectionOrder && Array.isArray(data.sectionOrder)) {
      return allSections.sort((a, b) => {
        const aIndex = data.sectionOrder!.indexOf(a.id)
        const bIndex = data.sectionOrder!.indexOf(b.id)

        // If both in sectionOrder, use that order
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex
        }

        // If only one is in sectionOrder, it comes first
        if (aIndex !== -1) return -1
        if (bIndex !== -1) return 1

        return 0
      })
    }

    return allSections
  }
  // Type guard to check if personalInfo uses new dynamic fields format
  const hasDynamicFields = (personalInfo: unknown): personalInfo is PersonalInfoWithFields => {
    return (
      typeof personalInfo === 'object' &&
      personalInfo !== null &&
      'fields' in personalInfo &&
      Array.isArray((personalInfo as PersonalInfoWithFields).fields)
    )
  }

  // Helper function to check if a field value is effectively empty
  const isEmptyValue = (value: string | undefined): boolean => {
    return !value || value.trim() === ''
  }

  // Placeholder underline component
  const PlaceholderUnderline = ({ width = 'w-48' }: { width?: string }) => (
    <span className={`border-b-2 border-black inline-block ${width}`}>&nbsp;</span>
  )

  const useDynamicFields = hasDynamicFields(data.personalInfo) ? data.personalInfo.fields : undefined

  // Get all fields sorted by order
  const getAllFields = (): ProfileField[] => {
    if (!useDynamicFields) return []
    return useDynamicFields.sort((a: ProfileField, b: ProfileField) => a.order - b.order)
  }

  const allFields = getAllFields()

  // Separate into name field, contact fields, and other fields
  const nameField = allFields.find((f: ProfileField) =>
    f.id === 'full-name' || f.label.toLowerCase().includes('name')
  )

  const headerFields = allFields.filter(
    (f: ProfileField) =>
      f.id !== 'full-name' &&
      !f.label.toLowerCase().includes('name') &&
      f.type !== 'textarea'
  )

  // Only get summary/description fields, not contact fields
  const summaryFields = allFields.filter(
    (f: ProfileField) =>
      f.id !== 'full-name' &&
      !f.label.toLowerCase().includes('name') &&
      f.type === 'textarea'
  )

  // Get full name for header
  const fullName: string = useDynamicFields
    ? nameField?.value || 'YOUR NAME'
    : String((data.personalInfo as unknown as Record<string, unknown>)?.fullName || 'YOUR NAME')

  // Legacy format helper
  const getLegacyValue = (key: string): string | undefined => {
    const legacyInfo = data.personalInfo as unknown as Record<string, unknown>
    const value = legacyInfo[key]
    return value ? String(value) : undefined
  }

  const sectionTitle = (section: string): string => {
    const headers = data.sectionHeaders
    if (!headers) return section
    const value = headers[section as keyof typeof headers]
    return value ? value.toUpperCase() : section
  }

  return (
    <Card className="p-8 bg-white text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* ATS Header - Clean and Simple */}
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-wide">{fullName}</h1>
        <div className="flex justify-center gap-4 mt-3 text-sm flex-wrap">
          {useDynamicFields ? (
            <>
              {headerFields.filter((f: ProfileField) => !isEmptyValue(f.value)).map((field: ProfileField, idx: number) => (
                <span key={field.id}>
                  {idx > 0 && '| '}
                  {field.value}
                </span>
              ))}
            </>
          ) : (
            <>
              {getLegacyValue('email') && <span>{getLegacyValue('email')}</span>}
              {getLegacyValue('phone') && <span>| {getLegacyValue('phone')}</span>}
              {getLegacyValue('location') && <span>| {getLegacyValue('location')}</span>}
              {getLegacyValue('linkedin') && <span>| {getLegacyValue('linkedin')}</span>}
            </>
          )}
        </div>
      </div>

      {/* Summary/Description Fields Only */}
      {useDynamicFields && summaryFields.length > 0 && (
        <div className="mb-6">
          {summaryFields.map((field: ProfileField) => (
            <div key={field.id} className="mb-4 last:mb-0">
              <h2 className="text-lg font-bold uppercase border-b border-gray-300 pb-1 mb-3">
                {field.label.toUpperCase()}
              </h2>
              {isEmptyValue(field.value) ? (
                <PlaceholderUnderline width="w-full" />
              ) : (
                <p className="text-sm leading-relaxed">{field.value}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Legacy format fallback for summary */}
      {!useDynamicFields && getLegacyValue('summary') && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b border-gray-300 pb-1 mb-3">
            {sectionTitle('PROFESSIONAL SUMMARY')}
          </h2>
          <p className="text-sm leading-relaxed">{getLegacyValue('summary')}</p>
        </div>
      )}

      {/* Render all sections in order */}
      {getAllSectionsInOrder().map((section) => {
        // Skip empty sections
        if (!section.data || section.data.length === 0) {
          return null
        }

        // Render based on section type
        if (section.type === 'skills') {
          const skillsData = section.data as Skill[]
          return (
            <div key={section.id} className="mb-6">
              <h2 className="text-lg font-bold uppercase border-b border-gray-300 pb-1 mb-3">
                {section.header.toUpperCase()}
              </h2>
              <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-sm">
                {skillsData.map((skill: Skill) => (
                  <div key={skill.id} className="flex">
                    <span className="mr-1">•</span>
                    <span className="font-medium">{skill.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        }

        if (section.type === 'experience') {
          const experienceData = section.data as Experience[]
          return (
            <div key={section.id} className="mb-6">
              <h2 className="text-lg font-bold uppercase border-b border-gray-300 pb-1 mb-3">
                {section.header.toUpperCase()}
              </h2>
              {experienceData.map((exp) => (
                <div key={exp.id} className="mb-5">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-sm">
                      {isEmptyValue(exp.company) ? <PlaceholderUnderline width="w-64" /> : exp.company}
                    </h3>
                    <span className="text-sm">
                      {isEmptyValue(exp.startDate) ? (
                        <PlaceholderUnderline width="w-32" />
                      ) : (
                        new Date(exp.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })
                      )}
                      {' - '}
                      {exp.current ? (
                        'Present'
                      ) : !exp.endDate || isEmptyValue(exp.endDate) ? (
                        <PlaceholderUnderline width="w-32" />
                      ) : (
                        new Date(exp.endDate).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })
                      )}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-sm italic">
                      {isEmptyValue(exp.position) ? <PlaceholderUnderline width="w-64" /> : exp.position}
                    </span>
                  </div>
                  {isEmptyValue(exp.description) ? (
                    <PlaceholderUnderline width="w-full" />
                  ) : (
                    <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                      {exp.description.split('\n').map((line, idx) => (
                        <li key={idx}>{line}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )
        }

        if (section.type === 'education') {
          const educationData = section.data as Education[]
          return (
            <div key={section.id} className="mb-6">
              <h2 className="text-lg font-bold uppercase border-b border-gray-300 pb-1 mb-3">
                {section.header.toUpperCase()}
              </h2>
              {educationData.map((edu: Education) => (
                <div key={edu.id} className="mb-4">
                  <div className="flex justify-between items-baseline mb-1">
                    <div>
                      <h3 className="font-bold text-sm">
                        {isEmptyValue(edu.institution) ? <PlaceholderUnderline width="w-64" /> : edu.institution}
                      </h3>
                      <div className="text-sm">
                        <span className="font-semibold">
                          {isEmptyValue(edu.degree) ? <PlaceholderUnderline width="w-48" /> : edu.degree}
                        </span>
                        {!isEmptyValue(edu.field) && <span> in {edu.field}</span>}
                        {isEmptyValue(edu.field) && <span> in <PlaceholderUnderline width="w-48" /></span>}
                      </div>
                    </div>
                    <div className="text-sm text-right">
                      <div>
                        {isEmptyValue(edu.startDate) ? (
                          <PlaceholderUnderline width="w-32" />
                        ) : (
                          new Date(edu.startDate).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                          })
                        )}
                      </div>
                      <div>
                        {isEmptyValue(edu.endDate) ? (
                          <PlaceholderUnderline width="w-32" />
                        ) : (
                          new Date(edu.endDate).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                          })
                        )}
                      </div>
                      {edu.gpa !== undefined && !isEmptyValue(edu.gpa) ? (
                        <div className="text-xs">GPA: {edu.gpa}</div>
                      ) : (
                        <div className="text-xs">GPA: <PlaceholderUnderline width="w-16" /></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        }

        // Handle dynamic sections (projects, certifications, custom)
        if (['projects', 'certifications', 'custom'].includes(section.type)) {
          return (
            <div key={section.id} className="mb-6">
              <h2 className="text-lg font-bold uppercase border-b border-gray-300 pb-1 mb-3">
                {section.header.toUpperCase()}
              </h2>

              {section.type === 'projects' && (
                <div className="space-y-3">
                  {(section.data as Record<string, unknown>[]).map((project: Record<string, unknown>) => {
                    const projectId = String(project?.id || '')
                    const title = String(project?.title || '')
                    const startDate = String(project?.startDate || '')
                    const endDate = project?.endDate ? String(project.endDate) : undefined
                    const current = Boolean(project?.current)
                    const description = project?.description ? String(project.description) : undefined
                    const technologies = project?.technologies ? String(project.technologies) : undefined
                    const url = project?.url ? String(project.url) : undefined

                    return (
                      <div key={projectId} className="mb-3">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-sm">
                            {isEmptyValue(title) ? (
                              <PlaceholderUnderline width="w-64" />
                            ) : (
                              title
                            )}
                          </h3>
                          <span className="text-sm">
                            {isEmptyValue(startDate) ? (
                              <PlaceholderUnderline width="w-32" />
                            ) : (
                              new Date(startDate).toLocaleDateString('en-US', {
                                month: 'short',
                                year: 'numeric',
                              })
                            )}
                            {' - '}
                            {current ? (
                              'Present'
                            ) : !endDate || isEmptyValue(endDate) ? (
                              <PlaceholderUnderline width="w-32" />
                            ) : (
                              new Date(endDate).toLocaleDateString('en-US', {
                                month: 'short',
                                year: 'numeric',
                              })
                            )}
                          </span>
                        </div>
                        {description && !isEmptyValue(description) && (
                          <p className="text-sm text-gray-700 mb-1">{description}</p>
                        )}
                        {technologies && !isEmptyValue(technologies) && (
                          <p className="text-xs text-gray-600">
                            <span className="font-semibold">Technologies:</span> {technologies}
                          </p>
                        )}
                        {url && !isEmptyValue(url) && (
                          <p className="text-xs text-blue-600">
                            <span className="font-semibold">URL:</span>{' '}
                            <a href={url} className="underline">
                              {url}
                            </a>
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {section.type === 'certifications' && (
                <div className="space-y-2">
                  {(section.data as Record<string, unknown>[]).map((cert: Record<string, unknown>) => {
                    const certId = String(cert?.id || '')
                    const name = cert?.name ? String(cert.name) : undefined
                    const issuer = cert?.issuer ? String(cert.issuer) : undefined
                    const credentialId = cert?.credentialId ? String(cert.credentialId) : undefined
                    const date = cert?.date ? String(cert.date) : undefined
                    const url = cert?.url ? String(cert.url) : undefined

                    return (
                      <div key={certId} className="mb-2">
                        <div className="flex justify-between items-baseline">
                          <div>
                            <div className="font-semibold text-sm">
                              {!name || isEmptyValue(name) ? (
                                <PlaceholderUnderline width="w-48" />
                              ) : (
                                name
                              )}
                            </div>
                            {issuer && !isEmptyValue(issuer) && (
                              <div className="text-sm text-gray-600">{issuer}</div>
                            )}
                            {credentialId && !isEmptyValue(credentialId) && (
                              <div className="text-xs text-gray-500">ID: {credentialId}</div>
                            )}
                          </div>
                          <div className="text-sm text-right">
                            {!date || isEmptyValue(date) ? (
                              <PlaceholderUnderline width="w-24" />
                            ) : (
                              new Date(date).toLocaleDateString('en-US', {
                                month: 'short',
                                year: 'numeric',
                              })
                            )}
                          </div>
                        </div>
                        {url && !isEmptyValue(url) && (
                          <div className="text-xs text-blue-600 mt-1">
                            <a href={url} className="underline">
                              {url}
                            </a>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {section.type === 'custom' && (
                <div className="space-y-3">
                  {(section.data as Record<string, unknown>[]).map((item: Record<string, unknown>) => {
                    // Get fieldConfig from the original section
                    const dataWithSections = data as CVData & { sections?: CVSection[] }
                    const originalSection = dataWithSections.sections?.find(s => s.id === section.id)
                    const fields = originalSection?.fieldConfig
                    const shouldHideLabel = fields && fields.length === 1 && fields[0].type === 'textarea'

                    if (!fields) return null

                    return (
                      <div key={String(item?.id || '')} className="mb-3 pb-3 border-b last:border-0">
                        {fields
                          .sort((a: FieldConfig, b: FieldConfig) => a.order - b.order)
                          .map((field: FieldConfig) => {
                            const value = item?.[field.id] as string | undefined
                            return (
                              <div key={field.id} className="text-sm mb-1">
                                {!shouldHideLabel && (
                                  <span className="font-semibold">{field.label}: </span>
                                )}
                                {isEmptyValue(value) ? (
                                  <PlaceholderUnderline width="w-32" />
                                ) : (
                                  <span>
                                    {field.type === 'url' && value ? (
                                      <a
                                        href={String(value)}
                                        className="text-blue-600 underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {String(value)}
                                      </a>
                                    ) : field.type === 'date' && value ? (
                                      new Date(String(value)).toLocaleDateString('en-US', {
                                        month: 'short',
                                        year: 'numeric',
                                      })
                                    ) : (
                                      String(value)
                                    )}
                                  </span>
                                )}
                              </div>
                            )
                          })}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        }

        return null
      })}
    </Card>
  )
}
