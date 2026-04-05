import { CVData } from '@/types/cv'

export function exportCVAsJSON(cvData: CVData, title: string) {
  const data = {
    version: '1.0',
    title,
    exportedAt: new Date().toISOString(),
    data: cvData
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_cv.json`
  link.click()
  URL.revokeObjectURL(url)
}
