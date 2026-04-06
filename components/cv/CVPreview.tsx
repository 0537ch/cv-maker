'use client'

import { CVData } from '@/types/cv'
import { ATSTemplate } from './templates/ATSTemplate'
import { useState, useMemo } from 'react'
import { Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CVPreview({ data }: { data: CVData; templateId: string }) {
  const [zoom, setZoom] = useState(1)

  // Calculate base scale based on viewport width
  const baseScale = useMemo(() => {
    if (typeof window === 'undefined') return 0.85
    const viewportWidth = window.innerWidth
    if (viewportWidth < 480) return 0.45
    if (viewportWidth < 768) return 0.6
    return 0.85
  }, [])

  const finalScale = zoom * baseScale

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5))
  const handleReset = () => setZoom(1)

  return (
    <div className="relative h-full w-full overflow-auto">
      {/* Zoom Controls */}
      <div className="sticky top-4 z-10 flex justify-center">
        <div className="flex items-center gap-2 rounded-lg bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 p-2 shadow-lg">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="min-h-11 min-w-11"
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-cyan-400 min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoom >= 2}
            className="min-h-11 min-w-11"
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={zoom === 1}
            className="min-h-11 min-w-11"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Scaled Preview */}
      <div className="flex items-start justify-center p-8">
        <div
          style={{
            transform: `scale(${finalScale})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease-out'
          }}
        >
          <ATSTemplate data={data} />
        </div>
      </div>
    </div>
  )
}
