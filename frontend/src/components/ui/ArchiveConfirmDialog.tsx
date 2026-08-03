import { useState } from 'react'
import { Archive } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { ModalActions, modalActionButtonClass } from '@/components/ui/ModalActions'
import { Button } from '@/components/ui/Button'

interface ArchiveConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title?: string
  description: string
  confirmLabel?: string
}

export function ArchiveConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Archive item?',
  description,
  confirmLabel = 'Archive',
}: ArchiveConfirmDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description="Archived items can be restored later. Nothing is permanently deleted."
      size="sm"
      footer={
        <ModalActions
          cancel={
            <Button variant="outline" className={modalActionButtonClass} onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          }
          confirm={
            <Button className={modalActionButtonClass} onClick={handleConfirm} loading={loading}>
              <Archive className="h-4 w-4" /> {confirmLabel}
            </Button>
          }
        />
      }
    >
      <p className="text-sm text-ink/70">{description}</p>
    </Modal>
  )
}
