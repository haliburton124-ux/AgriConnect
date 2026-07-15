import { useCallback, useEffect, useId, useMemo, useState, type ReactNode } from 'react'
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Marker,
  Popup,
  GeoJSON,
  ZoomControl,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import type { LatLngBoundsExpression } from 'leaflet'
import L from 'leaflet'
import { LocateFixed, MapPin, Search } from 'lucide-react'
import { toast } from 'sonner'
import 'leaflet/dist/leaflet.css'
import {
  DEFAULT_MAP_ZOOM,
  DETAIL_MAP_ZOOM,
  ESRI_ATTRIBUTION,
  ESRI_REFERENCE_LABELS_URL,
  ESRI_WORLD_IMAGERY_URL,
  ILOCOS_NORTE_CENTER,
  PICKER_MAP_ZOOM,
  PRIMARY_MARKER_STYLE,
  type MapCoords,
  isValidMapCoords,
} from '@/lib/mapConfig'
import { cn } from '@/lib/utils'

export interface AgriMapMarker {
  id: string | number
  lat: number
  lng: number
  radius?: number
  color?: string
  fillColor?: string
  fillOpacity?: number
  weight?: number
  popup?: ReactNode
}

export interface AgriMapProps {
  className?: string
  center?: [number, number]
  zoom?: number
  active?: boolean
  scrollWheelZoom?: boolean
  mapKey?: string

  value?: MapCoords | null
  onChange?: (coords: MapCoords) => void
  interactive?: boolean
  draggableMarker?: boolean

  markers?: AgriMapMarker[]
  geoJson?: GeoJSON.Geometry | null
  fitBounds?: LatLngBoundsExpression | null

  showGpsButton?: boolean
  showSearch?: boolean
  showCoordinates?: boolean
  hint?: string
  footer?: ReactNode
  children?: ReactNode
  embedded?: boolean
}

const pickerMarkerIcon = L.divIcon({
  className: 'agri-map-marker-icon',
  html: '<span class="agri-map-marker-dot"></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

function MapResize({ active }: { active: boolean }) {
  const map = useMap()

  useEffect(() => {
    if (!active) return
    const timer = window.setTimeout(() => map.invalidateSize(), 150)
    return () => window.clearTimeout(timer)
  }, [active, map])

  return null
}

function MapClickHandler({ enabled, onPick }: { enabled: boolean; onPick: (coords: MapCoords) => void }) {
  useMapEvents({
    click(event) {
      if (!enabled) return
      onPick({ lat: event.latlng.lat, lng: event.latlng.lng })
    },
  })

  return null
}

function RecenterMap({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap()

  useEffect(() => {
    map.setView([lat, lng], zoom, { animate: true })
  }, [lat, lng, map, zoom])

  return null
}

function FitBounds({ bounds }: { bounds: LatLngBoundsExpression }) {
  const map = useMap()

  useEffect(() => {
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: DETAIL_MAP_ZOOM })
  }, [map, bounds])

  return null
}

function DraggablePickerMarker({
  position,
  onChange,
}: {
  position: MapCoords
  onChange: (coords: MapCoords) => void
}) {
  return (
    <Marker
      position={[position.lat, position.lng]}
      draggable
      icon={pickerMarkerIcon}
      eventHandlers={{
        dragend: (event) => {
          const { lat, lng } = event.target.getLatLng()
          onChange({ lat, lng })
        },
      }}
    />
  )
}

interface SearchResult {
  display_name: string
  lat: string
  lon: string
}

function MapLocationSearch({ onSelect }: { onSelect: (coords: MapCoords) => void }) {
  const searchId = useId()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 3) {
      setResults([])
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setSearching(true)
      try {
        const params = new URLSearchParams({
          format: 'json',
          q: trimmed,
          countrycodes: 'ph',
          limit: '5',
          viewbox: '120.0,18.0,121.2,18.8',
          bounded: '1',
        })
        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        })
        if (!response.ok) throw new Error('Search failed')
        const data = (await response.json()) as SearchResult[]
        setResults(data)
      } catch {
        if (!controller.signal.aborted) setResults([])
      } finally {
        if (!controller.signal.aborted) setSearching(false)
      }
    }, 400)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [query])

  return (
    <div className="relative">
      <label htmlFor={searchId} className="sr-only">Search location</label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search location in Ilocos Norte…"
          className="h-10 w-full rounded-xl border border-black/10 bg-white/95 pl-9 pr-3 text-sm text-ink shadow-sm backdrop-blur-sm focus-visible:border-forest-light focus-visible:outline-none"
        />
      </div>
      {(searching || results.length > 0) && query.trim().length >= 3 && (
        <ul className="absolute z-[500] mt-1 max-h-44 w-full overflow-y-auto rounded-xl border border-black/10 bg-white py-1 shadow-card">
          {searching && results.length === 0 && (
            <li className="px-3 py-2 text-xs text-muted-foreground">Searching…</li>
          )}
          {results.map((result) => (
            <li key={`${result.lat}-${result.lon}`}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-xs text-ink hover:bg-forest/[0.05]"
                onClick={() => {
                  onSelect({ lat: Number(result.lat), lng: Number(result.lon) })
                  setQuery(result.display_name.split(',')[0] ?? result.display_name)
                  setResults([])
                }}
              >
                {result.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function AgriMap({
  className,
  center,
  zoom,
  active = true,
  scrollWheelZoom = true,
  mapKey,
  value,
  onChange,
  interactive = false,
  draggableMarker = true,
  markers = [],
  geoJson,
  fitBounds,
  showGpsButton = false,
  showSearch = false,
  showCoordinates = false,
  hint,
  footer,
  children,
  embedded = false,
}: AgriMapProps) {
  const hasPicker = Boolean(onChange)
  const resolvedCenter = useMemo<[number, number]>(() => {
    if (value && isValidMapCoords(value)) return [value.lat, value.lng]
    if (center) return center
    if (markers.length > 0) return [markers[0].lat, markers[0].lng]
    return ILOCOS_NORTE_CENTER
  }, [center, markers, value])

  const resolvedZoom = zoom ?? (value && isValidMapCoords(value) ? PICKER_MAP_ZOOM : DEFAULT_MAP_ZOOM)

  const useCurrentLocation = useCallback(() => {
    if (!onChange) return
    if (!navigator.geolocation) {
      toast.error('Location services are not available on this device.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => toast.error('Could not access your location. Please enable location services or tap the map.'),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    )
  }, [onChange])

  const showPickerMarker = hasPicker && value && isValidMapCoords(value)
  const showStaticMarker = !hasPicker && value && isValidMapCoords(value) && markers.length === 0

  const mapBody = (
    <div className={cn(!embedded && 'overflow-hidden rounded-xl border-2 border-black/5', embedded && 'h-full w-full')}>
      <MapContainer
        key={mapKey ?? (active ? 'agri-map-active' : 'agri-map-idle')}
        center={resolvedCenter}
        zoom={resolvedZoom}
        className={cn('h-56 w-full touch-manipulation sm:h-64', className)}
        scrollWheelZoom={scrollWheelZoom}
        zoomControl={false}
      >
        <TileLayer attribution={ESRI_ATTRIBUTION} url={ESRI_WORLD_IMAGERY_URL} />
        <TileLayer url={ESRI_REFERENCE_LABELS_URL} />

        <ZoomControl position="bottomright" />
        <MapResize active={active} />
        {onChange && <MapClickHandler enabled={interactive || hasPicker} onPick={onChange} />}

        {value && isValidMapCoords(value) && (
          <RecenterMap lat={value.lat} lng={value.lng} zoom={PICKER_MAP_ZOOM} />
        )}

        {fitBounds && <FitBounds bounds={fitBounds} />}

        {geoJson && (
          <GeoJSON
            data={geoJson}
            style={{
              color: PRIMARY_MARKER_STYLE.color,
              fillColor: PRIMARY_MARKER_STYLE.fillColor,
              fillOpacity: 0.3,
              weight: 2,
            }}
          />
        )}

        {showPickerMarker && draggableMarker && (
          <DraggablePickerMarker position={value} onChange={onChange!} />
        )}

        {showPickerMarker && !draggableMarker && (
          <CircleMarker center={[value.lat, value.lng]} radius={10} pathOptions={PRIMARY_MARKER_STYLE} />
        )}

        {showStaticMarker && value && (
          <CircleMarker center={[value.lat, value.lng]} radius={10} pathOptions={PRIMARY_MARKER_STYLE} />
        )}

        {markers.map((marker) => (
          <CircleMarker
            key={marker.id}
            center={[marker.lat, marker.lng]}
            radius={marker.radius ?? 10}
            pathOptions={{
              color: marker.color ?? PRIMARY_MARKER_STYLE.color,
              fillColor: marker.fillColor ?? marker.color ?? PRIMARY_MARKER_STYLE.fillColor,
              fillOpacity: marker.fillOpacity ?? 0.85,
              weight: marker.weight ?? 2,
            }}
          >
            {marker.popup && <Popup>{marker.popup}</Popup>}
          </CircleMarker>
        ))}

        {children}
      </MapContainer>
    </div>
  )

  if (embedded) return mapBody

  return (
    <div className="space-y-3">
      {(showSearch || showGpsButton) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          {showSearch && onChange && (
            <div className="flex-1">
              <MapLocationSearch onSelect={onChange} />
            </div>
          )}
          {showGpsButton && onChange && (
            <button
              type="button"
              onClick={useCurrentLocation}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-forest-light/40 bg-forest/[0.02] px-4 py-2.5 text-sm font-medium text-forest transition-colors hover:bg-forest/5 sm:h-10"
            >
              <LocateFixed className="h-4 w-4" />
              Use my location
            </button>
          )}
        </div>
      )}

      {mapBody}

      {(hint || showCoordinates) && (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          {showCoordinates && value && isValidMapCoords(value) && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground sm:justify-end">
              <MapPin className="h-3.5 w-3.5 text-forest" />
              {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
            </p>
          )}
        </div>
      )}

      {footer}
    </div>
  )
}

export type { MapCoords }
