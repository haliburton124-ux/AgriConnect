import { Modal } from '@/components/ui/Modal'
import { FarmLocationMap } from '@/components/farms/FarmLocationMap'
import { isValidFarmLocation } from '@/lib/farms'
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
        isValidFarmLocation(farm) ? (
          <FarmLocationMap
            farm={farm}
            active={open}
            mapKey={`farm-view-${farm.id}`}
            className="h-80 w-full sm:h-96"
            openPopup
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            This farm does not have GPS coordinates yet. Edit the farm to pin its location on the map.
          </p>
        )
      )}
    </Modal>
  )
}
