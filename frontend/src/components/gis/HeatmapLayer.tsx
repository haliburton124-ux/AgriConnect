import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'
import type { HeatPoint } from '@/services/gisService'

interface HeatmapLayerProps {
  points: HeatPoint[]
}

/**
 * Thin bridge between react-leaflet's declarative world and the imperative
 * leaflet.heat plugin — adds/removes the heat layer as `points` changes.
 * Gradient matches the platform palette: green (low) → gold (medium) → red (critical).
 */
export function HeatmapLayer({ points }: HeatmapLayerProps) {
  const map = useMap()

  useEffect(() => {
    if (points.length === 0) return

    const layer = L.heatLayer(points, {
      radius: 28,
      blur: 20,
      maxZoom: 15,
      gradient: {
        0.2: '#66BB6A',
        0.5: '#F9A825',
        0.8: '#EF6C00',
        1.0: '#D32F2F',
      },
    })

    layer.addTo(map)

    return () => {
      map.removeLayer(layer)
    }
  }, [map, points])

  return null
}
