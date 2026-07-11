import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { motion } from 'framer-motion'
import { SlidersHorizontal, Flame, MapPinned } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { HeatmapLayer } from '@/components/gis/HeatmapLayer'
import { GisFilterModal } from '@/components/modals/GisFilterModal'
import { gisService, type GisFilters, type MapPoint, type HeatPoint } from '@/services/gisService'
import { useAuthStore } from '@/store/authStore'
import { formatDateTime, cn } from '@/lib/utils'

// Ilocos Norte's approximate geographic center.
const ILOCOS_NORTE_CENTER: [number, number] = [18.1647, 120.7116]

const SEVERITY_COLORS: Record<MapPoint['severity'], string> = {
  low: '#4CAF50',
  medium: '#F9A825',
  high: '#EF6C00',
  critical: '#D32F2F',
}

type ViewMode = 'markers' | 'heatmap'

export function GisMapPage() {
  const { user } = useAuthStore()
  const role = user!.role

  const [viewMode, setViewMode] = useState<ViewMode>('markers')
  const [filters, setFilters] = useState<GisFilters>({})
  const [filterOpen, setFilterOpen] = useState(false)
  const [points, setPoints] = useState<MapPoint[] | null>(null)
  const [heatPoints, setHeatPoints] = useState<HeatPoint[]>([])

  useEffect(() => {
    gisService.mapPoints(role, filters).then((res) => setPoints(res.data.data))
    gisService.heatmap(role, filters).then((res) => setHeatPoints(res.data.data))
  }, [role, filters])

  const activeFilterCount = Object.values(filters).filter((v) => v !== undefined && v !== '').length

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 animate-fade-in">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink">GIS Incident Map</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {role === 'municipal_office' && 'Incidents across your municipality.'}
            {role === 'technician' && 'Incidents assigned to you.'}
            {(role === 'provincial_office' || role === 'admin') && 'Incidents across Ilocos Norte.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-black/5 bg-white p-1 shadow-card">
            <button
              onClick={() => setViewMode('markers')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                viewMode === 'markers' ? 'bg-gradient-primary text-white' : 'text-ink/60 hover:bg-forest/5',
              )}
            >
              <MapPinned className="h-3.5 w-3.5" /> Markers
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                viewMode === 'heatmap' ? 'bg-gradient-primary text-white' : 'text-ink/60 hover:bg-forest/5',
              )}
            >
              <Flame className="h-3.5 w-3.5" /> Heatmap
            </button>
          </div>

          <Button variant="outline" onClick={() => setFilterOpen(true)}>
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      <Card className="relative flex-1 overflow-hidden p-0">
        <MapContainer center={ILOCOS_NORTE_CENTER} zoom={10} className="h-full w-full" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {viewMode === 'heatmap' && <HeatmapLayer points={heatPoints} />}

          {viewMode === 'markers' && points?.map((point) => (
            <CircleMarker
              key={point.id}
              center={[point.latitude, point.longitude]}
              radius={8}
              pathOptions={{
                color: SEVERITY_COLORS[point.severity],
                fillColor: SEVERITY_COLORS[point.severity],
                fillOpacity: 0.75,
                weight: 2,
              }}
            >
              <Popup>
                <div className="min-w-[180px] space-y-1.5 font-sans">
                  <p className="text-sm font-semibold text-ink">{point.title}</p>
                  <p className="text-xs text-muted-foreground">{point.reference_code}</p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <Badge variant={point.severity}>{point.severity}</Badge>
                    <Badge variant={point.status}>{point.status}</Badge>
                  </div>
                  {point.category && <p className="pt-1 text-xs text-ink/70">{point.category.name}</p>}
                  <p className="text-[11px] text-muted-foreground">{formatDateTime(point.created_at)}</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {points === null && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="h-8 w-8 rounded-full border-4 border-forest-light border-t-forest"
            />
          </div>
        )}

        <div className="absolute bottom-4 left-4 z-[400] rounded-xl bg-white/95 p-3 shadow-card backdrop-blur-sm">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Severity</p>
          <div className="flex flex-col gap-1">
            {(Object.entries(SEVERITY_COLORS) as [MapPoint['severity'], string][]).map(([severity, color]) => (
              <div key={severity} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs capitalize text-ink/70">{severity}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <GisFilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onApply={setFilters}
        showMunicipalityFilter={role === 'provincial_office' || role === 'admin'}
      />
    </div>
  )
}
