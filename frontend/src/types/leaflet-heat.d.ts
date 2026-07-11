// leaflet.heat ships no TypeScript types — minimal ambient declaration
// covering the subset of the API this project actually uses.
import * as L from 'leaflet'

declare module 'leaflet' {
  function heatLayer(
    latlngs: Array<[number, number, number?]>,
    options?: {
      minOpacity?: number
      maxZoom?: number
      radius?: number
      blur?: number
      max?: number
      gradient?: Record<number, string>
    },
  ): L.Layer

  namespace HeatLayer {
    // intentionally empty — namespace merge target for the function above
  }
}

declare module 'leaflet.heat'
