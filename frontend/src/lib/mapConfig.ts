export const ESRI_WORLD_IMAGERY_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

export const ESRI_ATTRIBUTION =
  'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'

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
