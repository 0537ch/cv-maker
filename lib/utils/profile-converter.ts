import { ProfileField } from '@/types/cv'

export function convertOldPersonalInfoToFields(oldInfo: Record<string, unknown>): ProfileField[] {
  const fields: ProfileField[] = []
  let order = 0

  // Convert all old fields to new dynamic format
  // All fields go to 'custom' section now
  if (oldInfo.fullName && typeof oldInfo.fullName === 'string') {
    fields.push({
      id: 'full-name',
      label: 'Full Name',
      value: oldInfo.fullName,
      type: 'text',
      required: true,
      section: 'custom',
      order: order++
    })
  }

  if (oldInfo.email && typeof oldInfo.email === 'string') {
    fields.push({
      id: 'email',
      label: 'Email',
      value: oldInfo.email,
      type: 'email',
      required: true,
      section: 'custom',
      order: order++
    })
  }

  if (oldInfo.phone && typeof oldInfo.phone === 'string') {
    fields.push({
      id: 'phone',
      label: 'Phone',
      value: oldInfo.phone,
      type: 'tel',
      required: true,
      section: 'custom',
      order: order++
    })
  }

  if (oldInfo.location && typeof oldInfo.location === 'string') {
    fields.push({
      id: 'location',
      label: 'Location',
      value: oldInfo.location,
      type: 'text',
      required: true,
      section: 'custom',
      order: order++
    })
  }

  if (oldInfo.website && typeof oldInfo.website === 'string') {
    fields.push({
      id: 'website',
      label: 'Website',
      value: oldInfo.website,
      type: 'url',
      required: false,
      section: 'custom',
      order: order++
    })
  }

  if (oldInfo.linkedin && typeof oldInfo.linkedin === 'string') {
    fields.push({
      id: 'linkedin',
      label: 'LinkedIn',
      value: oldInfo.linkedin,
      type: 'url',
      required: false,
      section: 'custom',
      order: order++
    })
  }

  if (oldInfo.github && typeof oldInfo.github === 'string') {
    fields.push({
      id: 'github',
      label: 'GitHub',
      value: oldInfo.github,
      type: 'url',
      required: false,
      section: 'custom',
      order: order++
    })
  }

  if (oldInfo.summary && typeof oldInfo.summary === 'string') {
    fields.push({
      id: 'summary',
      label: 'Professional Summary',
      value: oldInfo.summary,
      type: 'textarea',
      required: true,
      section: 'custom',
      order: order++
    })
  }

  return fields
}

export function convertFieldsToOldPersonalInfo(fields: ProfileField[]): Record<string, string> {
  const oldInfo: Record<string, string> = {}

  fields.forEach(field => {
    // Map by field id for backward compatibility
    oldInfo[field.id] = field.value
  })

  return oldInfo
}
