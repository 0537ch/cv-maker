'use client'
import { useState, useEffect } from 'react'
import { CV, CVData, CVSection, FieldConfig } from '@/types/cv'
import { CVPreview } from './CVPreview'
import { CollapsibleTreeEditor } from './CollapsibleTreeEditor'
import { AddSectionModal } from './AddSectionModal'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { exportCVAsPDF } from '@/lib/export/export-pdf'
import { convertOldPersonalInfoToFields } from '@/lib/utils/profile-converter'
import { SECTION_REGISTRY } from '@/lib/section-registry'

export function CVEditor({ cv }: { cv: CV }) {
  const router = useRouter()
  const supabase = createClient()

  // Convert Prisma.JsonObject to CVData with proper validation
  const initialCvData: CVData = (cv.cv_data as unknown) as CVData
  const [cvData, setCvData] = useState<CVData>(() => {
    if (initialCvData.personalInfo && !('fields' in initialCvData.personalInfo)) {
      return {
        ...initialCvData,
        personalInfo: { fields: convertOldPersonalInfoToFields(initialCvData.personalInfo as Record<string, unknown>) }
      }
    }
    return initialCvData
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [showAddSectionModal, setShowAddSectionModal] = useState(false)

  const handleAddSection = (type: string, config?: { label?: string; fieldConfig?: FieldConfig[] }) => {
    const existingSections = (cvData as CVData & { sections?: CVSection[] }).sections || []
    const newSection: CVSection = {
      id: `${type}-${Date.now()}`,
      type,
      label: config?.label || SECTION_REGISTRY[type].label,
      header: SECTION_REGISTRY[type].defaultHeader,
      data: [],
      fieldConfig: config?.fieldConfig,
      order: existingSections.length + 1,
      isCustom: type === 'custom'
    }

    setCvData({
      ...cvData,
      sections: [...existingSections, newSection]
    } as CVData)
  }

  // Auto-save with debounce
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (JSON.stringify(cvData) !== JSON.stringify(cv.cv_data)) {
        try {
          setSaveError(null)
          setSaving(true)
          const { error } = await supabase
            .from('cvs')
            .update({ cv_data: cvData, updated_at: new Date().toISOString() })
            .eq('id', cv.id)

          if (error) throw error
          setSaving(false)
        } catch (error) {
          console.error('Auto-save failed:', error)
          setSaveError('Failed to save changes')
          setSaving(false)
        }
      }
    }, 1000)

    return () => clearTimeout(timeout)
  }, [cvData, cv.id, cv.cv_data, supabase])

  const handleExportPDF = async () => {
    try {
      setExportLoading(true)
      await exportCVAsPDF(cvData, `${cv.title}-CV.pdf`)
    } catch (error) {
      console.error('Failed to export PDF:', error)
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
      {/* Editor Panel - Left */}
      <div className="w-full lg:w-1/3 border-r overflow-hidden flex flex-col bg-background">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
            >
              ← Back
            </Button>
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold truncate max-w-50">{cv.title}</h1>
              {saving && <span className="text-xs text-muted-foreground">Saving...</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddSectionModal(true)}
              className="flex-1"
            >
              + Add Section
            </Button>
          </div>

          {saveError && (
            <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm mt-4">
              {saveError}
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <CollapsibleTreeEditor cvData={cvData} onChange={setCvData} />
        </div>
      </div>

      {/* Preview Panel - Right (A4-sized) */}
      <div className="flex-1 overflow-hidden flex flex-col bg-muted/30">
        {/* Header */}
        <div className="p-8 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Preview</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                loading={exportLoading}
                loadingText="Exporting PDF..."
              >
                Export PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* A4 Preview Container */}
          <div className="flex justify-center">
            <div className="bg-white shadow-lg" style={{
              width: '210mm',
              minHeight: '297mm',
              transform: 'scale(0.85)',
              transformOrigin: 'top center'
            }}>
              <CVPreview data={cvData} templateId={cv.template_id} />
            </div>
          </div>
        </div>
      </div>

      {/* Add Section Modal */}
      <AddSectionModal
        open={showAddSectionModal}
        onClose={() => setShowAddSectionModal(false)}
        onAddSection={handleAddSection}
      />
    </div>
  )
}
