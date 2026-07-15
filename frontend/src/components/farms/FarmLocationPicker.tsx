import { AgriMap, type MapCoords } from '@/components/map'

export type { MapCoords as FarmCoords }

interface FarmLocationPickerProps {
  value: MapCoords | null
  onChange: (coords: MapCoords) => void
  active?: boolean
  className?: string
}

export function FarmLocationPicker({ value, onChange, active = true, className }: FarmLocationPickerProps) {
  return (
    <AgriMap
      value={value}
      onChange={onChange}
      active={active}
      interactive
      showGpsButton
      showSearch
      showCoordinates
      scrollWheelZoom={false}
      className={className}
      hint="Tap the map, drag the marker, search for a place, or use your current GPS position."
    />
  )
}
