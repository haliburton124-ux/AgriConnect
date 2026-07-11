import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON, useMap } from 'react-leaflet'
import type { LatLngBoundsExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Farm } from '@/types'

interface FarmLocationMapProps {
  farm: Farm
  className?: string
}

function FitBounds({ bounds }: { bounds: LatLngBoundsExpression }) {
  const map = useMap()

  useEffect(() => {
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 16 })
  }, [map, bounds])

  return null
}

function polygonBounds(geojson: GeoJSON.Polygon): LatLngBoundsExpression {
  return geojson.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number])
}

export function FarmLocationMap({ farm, className = 'h-72 w-full' }: FarmLocationMapProps) {
  const boundary = farm.boundaries?.[0]?.geojson
  const center: [number, number] = [farm.latitude, farm.longitude]
  const bounds = boundary ? polygonBounds(boundary) : null

  return (
    <MapContainer center={center} zoom={14} className={className} scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {bounds && <FitBounds bounds={bounds} />}

      {boundary && (
        <GeoJSON
          data={boundary}
          style={{
            color: '#2E7D32',
            fillColor: '#66BB6A',
            fillOpacity: 0.3,
            weight: 2,
          }}
        />
      )}

      <CircleMarker
        center={center}
        radius={10}
        pathOptions={{
          color: '#1B5E20',
          fillColor: '#2E7D32',
          fillOpacity: 0.9,
          weight: 2,
        }}
      >
        <Popup>
          <div className="min-w-[160px] space-y-1 font-sans">
            <p className="text-sm font-semibold text-ink">{farm.farm_name}</p>
            <p className="text-xs text-muted-foreground">
              Brgy. {farm.barangay?.name}, {farm.municipality?.name}
            </p>
            {farm.area_hectares && (
              <p className="text-xs text-ink/70">{farm.area_hectares} hectares</p>
            )}
          </div>
        </Popup>
      </CircleMarker>
    </MapContainer>
  )
}
