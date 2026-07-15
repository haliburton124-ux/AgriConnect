import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Sprout, Plus, MapPin, Pencil, Trash2, Ruler } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { AddEditFarmModal } from '@/components/modals/AddEditFarmModal'
import { FarmViewModal } from '@/components/modals/FarmViewModal'
import { farmService } from '@/services/farmService'
import { getApiErrorMessage } from '@/lib/api'
import type { Farm } from '@/types'

export function FarmerFarmsPage() {
  const [farms, setFarms] = useState<Farm[] | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null)
  const [viewingFarm, setViewingFarm] = useState<Farm | null>(null)

  const load = () => {
    setFarms(null)
    farmService.list().then((res) => {
      const nextFarms = res.data.data
      setFarms(nextFarms)
      setViewingFarm((current) => {
        if (!current) return null
        return nextFarms.find((farm) => farm.id === current.id) ?? null
      })
    })
  }

  useEffect(load, [])

  const openCreate = () => {
    setEditingFarm(null)
    setModalOpen(true)
  }

  const openEdit = (farm: Farm) => {
    setEditingFarm(farm)
    setModalOpen(true)
  }

  const openFarmView = (farm: Farm) => {
    setViewingFarm(farm)
  }

  const handleDelete = async (farm: Farm) => {
    if (!window.confirm(`Remove "${farm.farm_name}"? This cannot be undone.`)) return
    try {
      await farmService.remove(farm.id)
      toast.success('Farm removed.')
      if (viewingFarm?.id === farm.id) setViewingFarm(null)
      load()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink">My Farms</h1>
          <p className="mt-1 text-sm text-muted-foreground">Register and manage the farms you report incidents from.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Register Farm
        </Button>
      </div>

      {farms === null ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-44 w-full rounded-2xl" />)}
        </div>
      ) : farms.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState icon={Sprout} title="No farms registered yet" description="Register your first farm to start reporting incidents against it." actionLabel="Register Farm" onAction={openCreate} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {farms.map((farm, i) => (
            <motion.div
              key={farm.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-full transition-shadow hover:shadow-glass">
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <div className="flex items-start justify-between">
                    <button
                      type="button"
                      title="View farm on map"
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-white transition-transform hover:scale-105"
                      onClick={() => openFarmView(farm)}
                    >
                      <Sprout className="h-5 w-5" />
                    </button>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Edit"
                        onClick={(event) => {
                          event.stopPropagation()
                          openEdit(farm)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Remove"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleDelete(farm)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-ink">{farm.farm_name}</h3>
                    <p className="text-xs capitalize text-muted-foreground">{farm.farm_type}{farm.primary_crop ? ` · ${farm.primary_crop}` : ''}</p>
                  </div>

                  <div className="mt-auto space-y-1.5 text-xs text-ink/70">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-forest" />
                      Brgy. {farm.barangay?.name}, {farm.municipality?.name}
                    </p>
                    {farm.area_hectares && (
                      <p className="flex items-center gap-1.5">
                        <Ruler className="h-3.5 w-3.5 text-forest" />
                        {farm.area_hectares} hectares
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <FarmViewModal
        open={Boolean(viewingFarm)}
        onClose={() => setViewingFarm(null)}
        farm={viewingFarm}
      />

      <AddEditFarmModal open={modalOpen} onClose={() => setModalOpen(false)} farm={editingFarm} onSuccess={load} />
    </div>
  )
}
