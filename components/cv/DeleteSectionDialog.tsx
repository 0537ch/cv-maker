'use client'

import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { DeleteSectionDialogProps } from '@/types/cv'

export function DeleteSectionDialog({
  open,
  onOpenChange,
  onConfirm,
  sectionLabel,
}: DeleteSectionDialogProps) {
  return (
    <DeleteConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={`Delete ${sectionLabel}?`}
      description={`This action cannot be undone. This will permanently delete the ${sectionLabel} section and all its data.`}
    />
  )
}
