import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, useMap, useMapEvents } from 'react-leaflet'
import { LocateFixed, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import 'leaflet/dist/leaflet.css'
import { cn } from '@/lib/utils'

const ILOCOS_NORTE_CENTER: [number, number] = [18.1647, 120.7116]

export interface FarmCoords {
  lat: number
  lng: number
}

interface FarmLocationPickerProps {
  value: FarmCoords | null
  onChange: (coords: FarmCoords) => void
  active?: boolean
  className?: string
}

function MapResize({ active }: { active: boolean }) {
  const map = useMap()

  useEffect(() => {
    if (!active) return
    const timer = window.setTimeout(() => map.invalidateSize(), 150)
    return () => window.clearTimeout(timer)
  }, [active, map])

  return null
}

function MapClickHandler({ onPick }: { onPick: (coords: FarmCoords) => void }) {
  useMapEvents({
    click(event) {
      onPick({ lat: event.latlng.lat, lng: event.latlng.lng })
    },
  })

  return null
}

function RecenterMap({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, zoom, { animate: true })
  }, [center, map, zoom])

  return null
}

export function FarmLocationPicker({ value, onChange, active = true, className }: FarmLocationPickerProps) {
  const center: [number, number] = value ? [value.lat, value.lng] : ILOCOS_NORTE_CENTER
  const zoom = value ? 16 : 10

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Location services are not available on this device.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => toast.error('Could not access your location. Please enable location services or tap the map to pin your farm.'),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    )
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border-2 border-black/5">
        <MapContainer
          key={active ? 'farm-picker-active' : 'farm-picker-idle'}
          center={center}
          zoom={zoom}
          className={cn('h-56 w-full touch-manipulation sm:h-64', className)}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapResize active={active} />
          <MapClickHandler onPick={onChange} />
          {value && <RecenterMap center={[value.lat, value.lng]} zoom={16} />}

          {value && (
            <CircleMarker
              center={[value.lat, value.lng]}
              radius={10}
              pathOptions={{
                color: '#1B5E20',
                fillColor: '#2E7D32',
                fillOpacity: 0.9,
                weight: 2,
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Tap the map to pin your farm location, or use your current GPS position.
        </p>
        <button
          type="button"
          onClick={useCurrentLocation}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-forest-light/40 bg-forest/[0.02] px-4 py-2.5 text-sm font-medium text-forest transition-colors hover:bg-forest/5"
        >
          <LocateFixed className="h-4 w-4" />
          Use my location
        </button>
      </div>

      {value && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-forest" />
          {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
        </p>
      )}
    </div>
  )
}
