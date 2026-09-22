export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ?? ''

export const MAPBOX_STYLE = 'mapbox://styles/mapbox/satellite-streets-v12'

export const ILOCOS_NORTE_CENTER: [number, number] = [18.1647, 120.7116]

export const DEFAULT_MAP_ZOOM = 10
export const DETAIL_MAP_ZOOM = 14
export const PICKER_MAP_ZOOM = 16

export const PRIMARY_MARKER_STYLE = {
  color: '#1B5E20',
  fillColor: '#2E7D32',
  fillOpacity: 0.9,
  weight: 2,
} as const

export interface MapCoords {
  lat: number
  lng: number
}

export function isValidMapCoords(coords: Partial<MapCoords> | null | undefined): coords is MapCoords {
  if (!coords) return false
  const lat = coords.lat
  const lng = coords.lng
  if (lat === undefined || lng === undefined) return false
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false
  if (lat === 0 && lng === 0) return false
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

/** Convert [lat, lng] points into a Mapbox [[west, south], [east, north]] box. */
export function latLngPointsToBounds(points: [number, number][]): [[number, number], [number, number]] | null {
  if (points.length === 0) return null
  let minLat = points[0][0]
  let maxLat = points[0][0]
  let minLng = points[0][1]
  let maxLng = points[0][1]
  for (const [lat, lng] of points) {
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
  }
  return [[minLng, minLat], [maxLng, maxLat]]
}
