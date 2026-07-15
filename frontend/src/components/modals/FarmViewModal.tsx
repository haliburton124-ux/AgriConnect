import { Modal } from '@/components/ui/Modal'
import { FarmLocationMap } from '@/components/farms/FarmLocationMap'
import type { Farm } from '@/types'

interface FarmViewModalProps {
  open: boolean
  onClose: () => void
  farm: Farm | null
}

export function FarmViewModal({ open, onClose, farm }: FarmViewModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={farm?.farm_name ?? 'Farm Location'}
      description="Farm location on map"
      size="lg"
    >
      {farm && (
        <FarmLocationMap farm={farm} active={open} className="h-80 w-full sm:h-96" openPopup />
      )}
    </Modal>
  )
}
