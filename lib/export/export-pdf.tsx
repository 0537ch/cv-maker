import { CVData, CVSection, Experience, Education, Skill } from '@/types/cv'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

interface ProfileField {
  id: string
  label: string
  value: string
  type: string
  order: number
}

interface OrderedSection {
  id: string
  type: string
  data: unknown[]
  header: string
  label: string
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 20,
    borderBottom: '2pt solid black',
    paddingBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 9,
    textAlign: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  contactItem: {
    marginRight: 4,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 10,
    borderBottom: '1pt solid #ccc',
    paddingBottom: 4,
  },
  section: {
    marginBottom: 16,
  },
  experienceItem: {
    marginBottom: 12,
  },
  company: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  position: {
    fontSize: 10,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  date: {
    fontSize: 9,
    marginBottom: 4,
  },
  description: {
    fontSize: 9,
    marginLeft: 12,
  },
  educationItem: {
    marginBottom: 10,
  },
  institution: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  degree: {
    fontSize: 10,
    marginBottom: 4,
  },
  skillItem: {
    fontSize: 9,
    marginBottom: 2,
    flexDirection: 'row',
  },
  bullet: {
    marginRight: 4,
  },
})

interface ATSPDFDocumentProps {
  data: CVData
}

function ATSPDFDocument({ data }: ATSPDFDocumentProps) {
  const hasDynamicFields = (personalInfo: unknown): personalInfo is { fields: ProfileField[] } => {
    return (
      typeof personalInfo === 'object' &&
      personalInfo !== null &&
      'fields' in personalInfo &&
      Array.isArray(personalInfo.fields)
    )
  }

  // Helper to get section data from unified sections only - NO fallback
  const getSectionData = (sectionId: string): unknown[] => {
    const dataWithSections = data as CVData & { sections?: CVSection[] }
    if (dataWithSections.sections && Array.isArray(dataWithSections.sections)) {
      const section = dataWithSections.sections.find((s: CVSection) => s.id === sectionId)
      return section?.data || []
    }

    // No fallback - return empty array if sections don't exist
    return []
  }

  const getSectionHeader = (sectionId: string, defaultHeader: string): string => {
    const dataWithSections = data as CVData & { sections?: CVSection[] }
    if (dataWithSections.sections && Array.isArray(dataWithSections.sections)) {
      const section = dataWithSections.sections.find((s: CVSection) => s.id === sectionId)
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

  const useDynamicFields = hasDynamicFields(data.personalInfo)
  const fields = useDynamicFields ? (data.personalInfo as { fields: ProfileField[] }).fields : []

  const nameField = fields.find((f: ProfileField) =>
    f.id === 'full-name' ||
    f.id === 'name' ||
    f.label?.toLowerCase()?.includes('name') ||
    f.order === 0
  )

  const contactFields = fields.filter((f: ProfileField) =>
    f.id !== 'full-name' &&
    f.id !== 'name' &&
    !f.label?.toLowerCase()?.includes('name') &&
    f.type !== 'textarea' &&
    !f.label?.toLowerCase()?.includes('summary') &&
    !f.label?.toLowerCase()?.includes('description')
  )

  const summaryFields = fields.filter((f: ProfileField) =>
    f.type === 'textarea' ||
    f.label?.toLowerCase()?.includes('summary') ||
    f.label?.toLowerCase()?.includes('description')
  )

  const fullName = nameField?.value || 'YOUR NAME'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{fullName}</Text>
          <View style={styles.contactInfo}>
            {contactFields.filter((f: ProfileField) => f.value?.trim()).map((field: ProfileField, idx: number, arr: ProfileField[]) => (
              <Text key={field.id} style={styles.contactItem}>
                {field.value}
                {idx < arr.length - 1 && ' | '}
              </Text>
            ))}
          </View>
        </View>

        {summaryFields.map((field: ProfileField) => (
          field.value?.trim() && (
            <View key={field.id} style={styles.section}>
              <Text style={styles.sectionHeader}>{field.label?.toUpperCase() || 'SUMMARY'}</Text>
              <Text style={{ fontSize: 9 }}>{field.value}</Text>
            </View>
          )
        ))}

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
              <View key={section.id} style={styles.section}>
                <Text style={styles.sectionHeader}>{section.header.toUpperCase()}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {skillsData.map((skill) => (
                    <View key={skill.id} style={styles.skillItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text>{skill.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )
          }

          if (section.type === 'experience') {
            const experienceData = section.data as Experience[]
            return (
              <View key={section.id} style={styles.section}>
                <Text style={styles.sectionHeader}>{section.header.toUpperCase()}</Text>
                {experienceData.map((exp) => (
                  <View key={exp.id} style={styles.experienceItem}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={styles.company}>{exp.company || 'Company'}</Text>
                      <Text style={styles.date}>
                        {exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Start Date'} - {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'End Date'}
                      </Text>
                    </View>
                    <Text style={styles.position}>{exp.position || 'Position'}</Text>
                    {exp.description && (
                      <View style={styles.description}>
                        {exp.description.split('\n').map((line, idx) => (
                          <Text key={idx}>{line}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )
          }

          if (section.type === 'education') {
            const educationData = section.data as Education[]
            return (
              <View key={section.id} style={styles.section}>
                <Text style={styles.sectionHeader}>{section.header.toUpperCase()}</Text>
                {educationData.map((edu) => (
                  <View key={edu.id} style={styles.educationItem}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <View>
                        <Text style={styles.institution}>{edu.institution || 'Institution'}</Text>
                        <Text style={styles.degree}>
                          {edu.degree || 'Degree'}{edu.field && ` in ${edu.field}`}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text>{edu.startDate ? new Date(edu.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Start'}</Text>
                        <Text>{edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'End'}</Text>
                        {edu.gpa && <Text style={{ fontSize: 8 }}>GPA: {edu.gpa}</Text>}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )
          }

          // Handle dynamic sections (projects, certifications, custom)
          if (['projects', 'certifications', 'custom'].includes(section.type)) {
            return (
              <View key={section.id} style={styles.section}>
                <Text style={styles.sectionHeader}>{section.header.toUpperCase()}</Text>

                {section.type === 'projects' && (section.data as Record<string, unknown>[]).map((project) => {
                  const title = project.title as string | undefined
                  const startDate = project.startDate as string | undefined
                  const endDate = project.endDate as string | undefined
                  const current = project.current as boolean | undefined
                  const description = project.description as string | undefined
                  const technologies = project.technologies as string | undefined

                  return (
                    <View key={String(project.id)} style={styles.experienceItem}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.company}>{title || 'Project Title'}</Text>
                        <Text style={styles.date}>
                          {startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Start'}
                          {' - '}
                          {current ? 'Present' : endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'End'}
                        </Text>
                      </View>
                      {description && (
                        <Text style={styles.description}>{description}</Text>
                      )}
                      {technologies && (
                        <Text style={{ fontSize: 9, marginTop: 2 }}>
                          <Text style={{ fontWeight: 'bold' }}>Technologies: </Text>
                          {technologies}
                        </Text>
                      )}
                    </View>
                  )
                })}

                {section.type === 'certifications' && (section.data as Record<string, unknown>[]).map((cert) => {
                  const name = cert.name as string | undefined
                  const issuer = cert.issuer as string | undefined
                  const credentialId = cert.credentialId as string | undefined
                  const date = cert.date as string | undefined

                  return (
                    <View key={String(cert.id)} style={styles.educationItem}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                          <Text style={styles.institution}>{name || 'Certification Name'}</Text>
                          {issuer && <Text style={styles.degree}>{issuer}</Text>}
                          {credentialId && <Text style={{ fontSize: 8 }}>ID: {credentialId}</Text>}
                        </View>
                        <Text style={styles.date}>
                          {date ? new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Date'}
                        </Text>
                      </View>
                    </View>
                  )
                })}

                {section.type === 'custom' && (
                  <View>
                    {(section.data as Record<string, unknown>[]).map((item) => {
                      // Get fieldConfig from the original section
                      const dataWithSections = data as CVData & { sections?: CVSection[] }
                      const originalSection = dataWithSections.sections?.find(s => s.id === section.id)
                      const fieldConfig = originalSection?.fieldConfig

                      if (!fieldConfig) return null

                      return (
                        <View key={String(item.id)} style={styles.experienceItem}>
                          {fieldConfig
                            .sort((a, b) => a.order - b.order)
                            .map((field) => {
                              const value = item[field.id]
                              return (
                                <Text key={field.id} style={{ fontSize: 9, marginBottom: 2 }}>
                                  <Text style={{ fontWeight: 'bold' }}>{field.label}: </Text>
                                  {String(value || '-')}
                                </Text>
                              )
                            })}
                        </View>
                      )
                    })}
                  </View>
                )}
              </View>
            )
          }

          return null
        })}
      </Page>
    </Document>
  )
}

export async function exportCVAsPDF(cvData: CVData, title: string) {
  const { pdf } = await import('@react-pdf/renderer')
  const blob = await pdf(<ATSPDFDocument data={cvData} />).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_cv.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}