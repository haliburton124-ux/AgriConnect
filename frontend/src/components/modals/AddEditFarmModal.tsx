import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { MapPin, LocateFixed } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { api, getApiErrorMessage } from '@/lib/api'
import { farmService } from '@/services/farmService'
import type { Farm } from '@/types'

const FARM_TYPES = ['rice', 'corn', 'vegetable', 'fruit', 'livestock', 'poultry', 'fishery', 'mixed', 'other']
const OWNERSHIP_STATUSES = ['owned', 'leased', 'tenant', 'other']

const schema = z.object({
  farm_name: z.string().min(2, 'Enter a farm name'),
  municipality_id: z.coerce.number().min(1, 'Select a municipality'),
  barangay_id: z.coerce.number().min(1, 'Select a barangay'),
  address: z.string().optional(),
  area_hectares: z.coerce.number().optional(),
  farm_type: z.string().min(1, 'Select a farm type'),
  primary_crop: z.string().optional(),
  ownership_status: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface AddEditFarmModalProps {
  open: boolean
  onClose: () => void
  farm?: Farm | null
  onSuccess: () => void
}

export function AddEditFarmModal({ open, onClose, farm, onSuccess }: AddEditFarmModalProps) {
  const isEditing = Boolean(farm)
  const [municipalities, setMunicipalities] = useState<{ id: number; name: string }[]>([])
  const [barangays, setBarangays] = useState<{ id: number; name: string }[]>([])
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const municipalityId = watch('municipality_id')

  useEffect(() => {
    if (!open) return
    api.get('/locations/municipalities').then((res) => setMunicipalities(res.data.data))

    if (farm) {
      reset({
        farm_name: farm.farm_name,
        municipality_id: farm.municipality?.id,
        barangay_id: farm.barangay?.id,
        address: farm.address ?? '',
        area_hectares: farm.area_hectares ?? undefined,
        farm_type: farm.farm_type,
        primary_crop: farm.primary_crop ?? '',
        ownership_status: undefined,
      })
      setCoords({ lat: farm.latitude, lng: farm.longitude })
    } else {
      reset({ farm_type: 'rice' })
      setCoords(null)
    }
  }, [open, farm]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (municipalityId) {
      api.get('/locations/barangays', { params: { municipality_id: municipalityId } }).then((res) => setBarangays(res.data.data))
    } else {
      setBarangays([])
    }
  }, [municipalityId])

  const useCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => toast.error('Could not access your location. Please enable location services.'),
    )
  }

  const close = () => {
    reset()
    setCoords(null)
    onClose()
  }

  const onSubmit = async (values: FormValues) => {
    if (!coords) {
      toast.error('Please set the farm\u2019s location before saving.')
      return
    }

    const payload = { ...values, latitude: coords.lat, longitude: coords.lng }

    try {
      if (isEditing && farm) {
        await farmService.update(farm.id, payload)
        toast.success('Farm updated successfully.')
      } else {
        await farmService.create(payload)
        toast.success('Farm registered successfully.')
      }
      onSuccess()
      close()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={isEditing ? 'Edit Farm' : 'Register Farm'}
      description="Farm details help technicians locate and assist you faster."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={close}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>{isEditing ? 'Save Changes' : 'Register Farm'}</Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <Input label="Farm name" error={errors.farm_name?.message} {...register('farm_name')} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Municipality</label>
            <select
              className="h-11 w-full rounded-xl border-2 border-input bg-white px-4 text-sm focus-visible:outline-none focus-visible:border-forest-light"
              {...register('municipality_id')}
            >
              <option value="">Select…</option>
              {municipalities.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            {errors.municipality_id && <p className="mt-1.5 text-xs text-danger">{errors.municipality_id.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Barangay</label>
            <select
              className="h-11 w-full rounded-xl border-2 border-input bg-white px-4 text-sm focus-visible:outline-none focus-visible:border-forest-light"
              {...register('barangay_id')}
            >
              <option value="">Select…</option>
              {barangays.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            {errors.barangay_id && <p className="mt-1.5 text-xs text-danger">{errors.barangay_id.message}</p>}
          </div>
        </div>

        <Input label="Address (optional)" {...register('address')} />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Farm Location (GPS)</label>
          <button
            type="button"
            onClick={useCurrentLocation}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-forest-light/40 bg-forest/[0.02] py-3 text-sm font-medium text-forest transition-colors hover:bg-forest/5"
          >
            <LocateFixed className="h-4 w-4" />
            {coords ? 'Update current location' : 'Use my current location'}
          </button>
          {coords && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Farm Type</label>
            <select
              className="h-11 w-full rounded-xl border-2 border-input bg-white px-4 text-sm capitalize focus-visible:outline-none focus-visible:border-forest-light"
              {...register('farm_type')}
            >
              {FARM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Input label="Area (hectares, optional)" type="number" step="0.01" {...register('area_hectares')} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Primary crop (optional)" {...register('primary_crop')} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Ownership (optional)</label>
            <select
              className="h-11 w-full rounded-xl border-2 border-input bg-white px-4 text-sm capitalize focus-visible:outline-none focus-visible:border-forest-light"
              {...register('ownership_status')}
            >
              <option value="">Select…</option>
              {OWNERSHIP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </form>
    </Modal>
  )
}
