import { CVData } from '@/types/cv'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Create styles for the PDF
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
  // Type guard to check if personalInfo uses new dynamic fields format
  const hasDynamicFields = (personalInfo: unknown): personalInfo is { fields: any[] } => {
    return (
      typeof personalInfo === 'object' &&
      personalInfo !== null &&
      'fields' in personalInfo &&
      Array.isArray((personalInfo as { fields: any[] }).fields)
    )
  }

  const useDynamicFields = hasDynamicFields(data.personalInfo)
  const fields = useDynamicFields ? data.personalInfo.fields : []

  // Get name field
  const nameField = fields.find((f: any) =>
    f.id === 'full-name' ||
    f.id === 'name' ||
    f.label?.toLowerCase()?.includes('name') ||
    f.order === 0
  )

  // Get contact fields (not textarea, not summary/description)
  const contactFields = fields.filter((f: any) =>
    f.id !== 'full-name' &&
    f.id !== 'name' &&
    !f.label?.toLowerCase()?.includes('name') &&
    f.type !== 'textarea' &&
    !f.label?.toLowerCase()?.includes('summary') &&
    !f.label?.toLowerCase()?.includes('description')
  )

  // Get summary/description fields
  const summaryFields = fields.filter((f: any) =>
    f.type === 'textarea' ||
    f.label?.toLowerCase()?.includes('summary') ||
    f.label?.toLowerCase()?.includes('description')
  )

  const fullName = nameField?.value || 'YOUR NAME'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{fullName}</Text>
          <View style={styles.contactInfo}>
            {contactFields.filter((f: any) => f.value?.trim()).map((field: any, idx: number) => (
              <Text key={field.id} style={styles.contactItem}>
                {field.value}
                {idx < contactFields.filter((f: any) => f.value?.trim()).length - 1 && ' | '}
              </Text>
            ))}
          </View>
        </View>

        {/* Summary Sections */}
        {summaryFields.map((field: any) => (
          field.value?.trim() && (
            <View key={field.id} style={styles.section}>
              <Text style={styles.sectionHeader}>{field.label?.toUpperCase() || 'SUMMARY'}</Text>
              <Text style={styles.page}>{field.value}</Text>
            </View>
          )
        ))}

        {/* Skills Section */}
        {data.skills && data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>CORE COMPETENCIES</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {data.skills.map((skill) => (
                <View key={skill.id} style={styles.skillItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text>{skill.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Experience Section */}
        {data.experience && data.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>
              {data.sectionHeaders?.experience?.toUpperCase() || 'PROFESSIONAL EXPERIENCE'}
            </Text>
            {data.experience.map((exp) => (
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
        )}

        {/* Education Section */}
        {data.education && data.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>
              {data.sectionHeaders?.education?.toUpperCase() || 'EDUCATION'}
            </Text>
            {data.education.map((edu) => (
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
        )}
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
