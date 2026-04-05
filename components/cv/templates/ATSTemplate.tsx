import { CVData, ProfileField, PersonalInfo } from '@/types/cv'
import { Card } from '@/components/ui/card'

type PersonalInfoWithFields = PersonalInfo & { fields: ProfileField[] }

export function ATSTemplate({ data }: { data: CVData }) {
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

      {/* Skills Section - Early for ATS */}
      {data.skills && data.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b border-gray-300 pb-1 mb-3">
            {sectionTitle('CORE COMPETENCIES')}
          </h2>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-sm">
            {data.skills.map((skill) => (
              <div key={skill.id} className="flex">
                <span className="mr-1">•</span>
                <span className="font-medium">{skill.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience Section */}
      {data.experience && data.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b border-gray-300 pb-1 mb-3">
            {sectionTitle('PROFESSIONAL EXPERIENCE')}
          </h2>
          {data.experience.map((exp) => (
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
      )}

      {/* Education Section */}
      {data.education && data.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b border-gray-300 pb-1 mb-3">
            {sectionTitle('EDUCATION')}
          </h2>
          {data.education.map((edu) => (
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
      )}
    </Card>
  )
}
