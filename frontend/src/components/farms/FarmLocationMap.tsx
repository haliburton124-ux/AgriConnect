import type { LatLngBoundsExpression } from 'leaflet'
import { AgriMap } from '@/components/map'
import { DETAIL_MAP_ZOOM } from '@/lib/mapConfig'
import type { Farm } from '@/types'

interface FarmLocationMapProps {
  farm: Farm
  className?: string
}

function polygonBounds(geojson: GeoJSON.Polygon): LatLngBoundsExpression {
  return geojson.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number])
}

export function FarmLocationMap({ farm, className = 'h-72 w-full' }: FarmLocationMapProps) {
  const boundary = farm.boundaries?.[0]?.geojson ?? null
  const bounds = boundary ? polygonBounds(boundary) : null

  return (
    <AgriMap
      className={className}
      center={[farm.latitude, farm.longitude]}
      zoom={DETAIL_MAP_ZOOM}
      scrollWheelZoom
      geoJson={boundary}
      fitBounds={bounds}
      markers={[
        {
          id: farm.id,
          lat: farm.latitude,
          lng: farm.longitude,
          popup: (
            <div className="min-w-[160px] space-y-1 font-sans">
              <p className="text-sm font-semibold text-ink">{farm.farm_name}</p>
              <p className="text-xs text-muted-foreground">
                Brgy. {farm.barangay?.name}, {farm.municipality?.name}
              </p>
              {farm.area_hectares && (
                <p className="text-xs text-ink/70">{farm.area_hectares} hectares</p>
              )}
            </div>
          ),
        },
      ]}
    />
  )
}
