import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import Map, { Layer, Marker, NavigationControl, Popup, Source } from 'react-map-gl/mapbox'
import type { MapMouseEvent, MapRef } from 'react-map-gl/mapbox'
import { LocateFixed, MapPin, Search } from 'lucide-react'
import { toast } from 'sonner'
import 'mapbox-gl/dist/mapbox-gl.css'
import {
  DEFAULT_MAP_ZOOM,
  DETAIL_MAP_ZOOM,
  ILOCOS_NORTE_CENTER,
  MAPBOX_STYLE,
  MAPBOX_TOKEN,
  PICKER_MAP_ZOOM,
  PRIMARY_MARKER_STYLE,
  type MapCoords,
  isValidMapCoords,
  latLngPointsToBounds,
} from '@/lib/mapConfig'
import { cn } from '@/lib/utils'
import type { HeatPoint } from '@/services/gisService'

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
  openPopup?: boolean
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
  heatmapPoints?: HeatPoint[]
  geoJson?: GeoJSON.Geometry | null
  fitBounds?: [number, number][] | null

  showGpsButton?: boolean
  showSearch?: boolean
  showCoordinates?: boolean
  hint?: string
  footer?: ReactNode
  children?: ReactNode
  embedded?: boolean
}

function MapPinDot({ color }: { color: string }) {
  return (
    <span
      className="agri-map-marker-dot block h-5 w-5 rounded-full border-[3px] border-white"
      style={{ backgroundColor: color }}
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
  heatmapPoints = [],
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
  const mapRef = useRef<MapRef>(null)
  const sourceId = useId().replace(/:/g, '')
  const hasPicker = Boolean(onChange)
  const [openPopupId, setOpenPopupId] = useState<string | number | null>(
    () => markers.find((marker) => marker.openPopup)?.id ?? null,
  )
  const autoOpenId = markers.find((marker) => marker.openPopup)?.id ?? null

  useEffect(() => {
    if (autoOpenId !== null) setOpenPopupId(autoOpenId)
  }, [autoOpenId])

  const resolvedCenter = useMemo<[number, number]>(() => {
    if (value && isValidMapCoords(value)) return [value.lat, value.lng]
    if (center) return center
    if (markers.length > 0) return [markers[0].lat, markers[0].lng]
    return ILOCOS_NORTE_CENTER
  }, [center, markers, value])

  const resolvedZoom = zoom ?? (value && isValidMapCoords(value) ? PICKER_MAP_ZOOM : DEFAULT_MAP_ZOOM)

  useEffect(() => {
    const map = mapRef.current
    if (!map || !active) return
    const resize = () => map.resize()
    const timer = window.setTimeout(resize, 150)
    const frame = window.requestAnimationFrame(resize)
    const observer = new ResizeObserver(resize)
    observer.observe(map.getContainer())
    window.addEventListener('resize', resize)
    return () => {
      window.clearTimeout(timer)
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [active, mapKey])

  useEffect(() => {
    if (!value || !isValidMapCoords(value)) return
    mapRef.current?.flyTo({
      center: [value.lng, value.lat],
      zoom: PICKER_MAP_ZOOM,
      essential: true,
    })
  }, [value])

  useEffect(() => {
    if (!fitBounds || fitBounds.length === 0) return
    const box = latLngPointsToBounds(fitBounds)
    if (!box) return
    mapRef.current?.fitBounds(box, { padding: 32, maxZoom: DETAIL_MAP_ZOOM, duration: 600 })
  }, [fitBounds])

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

  const handleMapClick = (event: MapMouseEvent) => {
    if (!(interactive || hasPicker) || !onChange) return
    const target = event.originalEvent.target as HTMLElement | null
    if (target?.closest('.agri-map-marker-dot, .mapboxgl-marker, .mapboxgl-popup')) return
    onChange({ lat: event.lngLat.lat, lng: event.lngLat.lng })
  }

  const showPickerMarker = hasPicker && value && isValidMapCoords(value)
  const showStaticMarker = !hasPicker && value && isValidMapCoords(value) && markers.length === 0
  const openMarker = markers.find((marker) => marker.id === openPopupId && marker.popup)

  const heatGeoJson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: heatmapPoints.map(([lat, lng, intensity], index) => ({
      type: 'Feature' as const,
      id: index,
      properties: { intensity },
      geometry: { type: 'Point' as const, coordinates: [lng, lat] },
    })),
  }), [heatmapPoints])

  const mapBody = (
    <div className={cn(!embedded && 'overflow-hidden rounded-xl border-2 border-black/5', embedded && 'absolute inset-0')}>
      <div
        className={cn(
          'relative w-full touch-manipulation',
          embedded ? 'h-full min-h-0' : 'h-56 sm:h-64',
          className,
        )}
      >
        <Map
          key={mapKey ?? (active ? 'agri-map-active' : 'agri-map-idle')}
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle={MAPBOX_STYLE}
          initialViewState={{
            longitude: resolvedCenter[1],
            latitude: resolvedCenter[0],
            zoom: resolvedZoom,
          }}
          style={{ width: '100%', height: '100%' }}
          scrollZoom={scrollWheelZoom}
          dragRotate={false}
          pitchWithRotate={false}
          attributionControl
          onClick={handleMapClick}
          onLoad={() => {
            const map = mapRef.current
            map?.resize()
            if (map && (interactive || hasPicker)) {
              map.getCanvas().style.cursor = 'crosshair'
            }
          }}
        >
          <NavigationControl position="bottom-right" showCompass={false} />

          {geoJson && (
            <Source id={`${sourceId}-boundary`} type="geojson" data={{ type: 'Feature', properties: {}, geometry: geoJson }}>
              <Layer
                id={`${sourceId}-boundary-fill`}
                type="fill"
                paint={{
                  'fill-color': PRIMARY_MARKER_STYLE.fillColor,
                  'fill-opacity': 0.3,
                }}
              />
              <Layer
                id={`${sourceId}-boundary-line`}
                type="line"
                paint={{
                  'line-color': PRIMARY_MARKER_STYLE.color,
                  'line-width': 2,
                }}
              />
            </Source>
          )}

          {heatmapPoints.length > 0 && (
            <Source id={`${sourceId}-heat`} type="geojson" data={heatGeoJson}>
              <Layer
                id={`${sourceId}-heat-layer`}
                type="heatmap"
                paint={{
                  'heatmap-weight': ['interpolate', ['linear'], ['get', 'intensity'], 0, 0, 1, 1],
                  'heatmap-intensity': 1.1,
                  'heatmap-radius': 28,
                  'heatmap-opacity': 0.8,
                  'heatmap-color': [
                    'interpolate',
                    ['linear'],
                    ['heatmap-density'],
                    0, 'rgba(102,187,106,0)',
                    0.2, '#66BB6A',
                    0.5, '#F9A825',
                    0.8, '#EF6C00',
                    1, '#D32F2F',
                  ],
                }}
              />
            </Source>
          )}

          {showPickerMarker && (
            <Marker
              longitude={value.lng}
              latitude={value.lat}
              anchor="center"
              draggable={draggableMarker}
              onDragEnd={(event) => onChange?.({ lat: event.lngLat.lat, lng: event.lngLat.lng })}
            >
              <MapPinDot color={PRIMARY_MARKER_STYLE.fillColor} />
            </Marker>
          )}

          {showStaticMarker && value && (
            <Marker longitude={value.lng} latitude={value.lat} anchor="center">
              <MapPinDot color={PRIMARY_MARKER_STYLE.fillColor} />
            </Marker>
          )}

          {markers.map((marker) => (
            <Marker
              key={marker.id}
              longitude={marker.lng}
              latitude={marker.lat}
              anchor="center"
              onClick={(event) => {
                event.originalEvent.stopPropagation()
                if (marker.popup) setOpenPopupId(marker.id)
              }}
            >
              <MapPinDot color={marker.fillColor ?? marker.color ?? PRIMARY_MARKER_STYLE.fillColor} />
            </Marker>
          ))}

          {openMarker && (
            <Popup
              longitude={openMarker.lng}
              latitude={openMarker.lat}
              anchor="bottom"
              offset={14}
              closeButton
              closeOnClick={false}
              onClose={() => setOpenPopupId(null)}
              className="agri-map-popup"
            >
              {openMarker.popup}
            </Popup>
          )}
        </Map>
        {children}
      </div>
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
