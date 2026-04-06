'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col lg:flex-row h-dvh overflow-hidden"
    >
      {/* Editor Panel - Left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full lg:w-1/3 border-r border-cyan-500/20 overflow-hidden flex flex-col bg-slate-900/60 backdrop-blur-xl relative group"
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

        {/* Header */}
        <div className="relative p-6 border-b border-cyan-500/20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex items-center justify-between"
          >
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="hover:bg-cyan-500/10 hover:text-cyan-400 hover:scale-105 transition-all duration-200"
            >
              ← Back
            </Button>
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold truncate max-w-50 bg-linear-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">{cv.title}</h1>
              {saving && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-xs text-cyan-400"
                >
                  <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  Saving...
                </motion.div>
              )}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="flex items-center gap-2 mt-4"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddSectionModal(true)}
              className="flex-1 border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-400/50 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-200"
            >
              + Add Section
            </Button>
          </motion.div>

          {saveError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-2 rounded-md text-sm mt-4 backdrop-blur-sm"
            >
              {saveError}
            </motion.div>
          )}
        </div>

        {/* Scrollable Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="relative flex-1 overflow-y-auto p-6"
        >
          <CollapsibleTreeEditor cvData={cvData} onChange={setCvData} />
        </motion.div>
      </motion.div>

      {/* Preview Panel - Right (A4-sized) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex-1 overflow-hidden flex flex-col bg-slate-900/60 backdrop-blur-xl relative"
      >
        {/* Ambient glow behind preview */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-200 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative p-8 border-b border-cyan-500/20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex items-center justify-between"
          >
            <h2 className="text-lg font-semibold bg-linear-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">Preview</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                loading={exportLoading}
                loadingText="Exporting PDF..."
                className="border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-400/50 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200"
              >
                Export PDF
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Scrollable Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="relative flex-1 overflow-auto p-4 sm:p-8 [-webkit-overflow-scrolling:touch]"
        >
          {/* A4 Preview Container */}
          <div className="flex justify-center">                                                                                                    
                  <div className="bg-white shadow-xl shadow-cyan-500/10" style={{                                                                        
                    width: '210mm',                                                                                                                      
                    minHeight: '297mm',                                                                                                                  
                    transform: 'scale(0.85)',                                                                                                            
                    transformOrigin: 'top center'                                                                                                        
                 }}>     
              <CVPreview data={cvData} templateId={cv.template_id} />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Add Section Modal */}
      <AddSectionModal
        open={showAddSectionModal}
        onClose={() => setShowAddSectionModal(false)}
        onAddSection={handleAddSection}
      />
    </motion.div>
  )
}
