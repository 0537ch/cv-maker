'use client'
import { CV } from '@/types/cv'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { Star, Delete } from '@hugeicons/core-free-icons'
import { Loader2 } from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function CVCard({ cv }: { cv: CV }) {
  const router = useRouter()
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState(cv.title)
  const [saveLoading, setSaveLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/cvs/${cv.id}`, { method: 'DELETE' })

      if (res.ok) {
        router.refresh()
      }
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleEdit = async () => {
    setEditLoading(true)
    router.push(`/editor/${cv.id}`)
    // Add minimal delay to show spinner for better UX
    await new Promise(resolve => setTimeout(resolve, 300))
    setEditLoading(false)
  }

  const handleToggleFavorite = async () => {
    await fetch(`/api/cvs/${cv.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_favorite: !cv.is_favorite }),
    })
    router.refresh()
  }

  const handleSaveTitle = async () => {
    if (editedTitle.trim() === '' || editedTitle === cv.title) {
      setIsEditingTitle(false)
      setEditedTitle(cv.title)
      return
    }

    setSaveLoading(true)
    try {
      const res = await fetch(`/api/cvs/${cv.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editedTitle.trim() }),
      })

      if (res.ok) {
        router.refresh()
      }
    } finally {
      setSaveLoading(false)
      setIsEditingTitle(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditingTitle(false)
    setEditedTitle(cv.title)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveTitle()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  return (
    <Card className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 hover:border-cyan-400/40 hover:bg-slate-900/70 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/10 group">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

      <CardHeader className="relative">
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSaveTitle}
                  className="w-full bg-slate-800 border border-cyan-500/30 rounded px-2 py-1 text-sm focus:outline-none focus:border-cyan-500 truncate"
                  autoFocus
                  disabled={saveLoading}
                />
                {saveLoading && (
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="text-left hover:text-cyan-400 transition-colors truncate w-full"
                title="Click to rename"
              >
                {cv.title}
              </button>
            )}
          </div>
          {cv.is_favorite && (
            <HugeiconsIcon icon={Star} className="h-5 w-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <p className="text-sm text-muted-foreground">
          Template: {cv.template_id}
        </p>
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date(cv.updated_at).toLocaleDateString()}
        </p>
      </CardContent>
      <CardFooter className="gap-2 relative">
        <Button
          onClick={handleEdit}
          className="flex-1"
          loading={editLoading}
          loadingText="Opening..."
        >
          Edit
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleToggleFavorite}
          className="hover:bg-cyan-500/10"
        >
          <HugeiconsIcon icon={Star} className={`h-4 w-4 ${cv.is_favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => setShowDeleteDialog(true)}
          loading={deleteLoading}
          loadingText="Deleting..."
        >
          <HugeiconsIcon icon={Delete} className="h-4 w-4" />
        </Button>
      </CardFooter>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete CV?"
        description="This action cannot be undone. This will permanently delete this CV and all its data."
      />
    </Card>
  )
}
