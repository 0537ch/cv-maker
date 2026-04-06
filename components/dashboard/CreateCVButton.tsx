'use client'
import { Button } from '@/components/ui/button'
import { Square } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function CreateCVButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cvs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled CV',
          template_id: 'ats',
        }),
      })

      if (res.ok) {
        const { cv } = await res.json()
        router.push(`/editor/${cv.id}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCreate}
      loading={loading}
      loadingText="Creating CV..."
      className="group px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 flex items-center gap-2"
    >
      <HugeiconsIcon icon={Square} className="h-4 w-4" />
      New CV
    </Button>
  )
}
