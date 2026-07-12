import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MunicipalityBarangayFields } from '@/components/forms/MunicipalityBarangayFields'
import { FarmLocationPicker } from '@/components/farms/FarmLocationPicker'
import { getApiErrorMessage } from '@/lib/api'
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
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const previousMunicipalityRef = useRef<number | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const municipalityId = watch('municipality_id')
  const barangayId = watch('barangay_id')

  useEffect(() => {
    if (!open) return

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
      previousMunicipalityRef.current = farm.municipality?.id ?? null
    } else {
      reset({ farm_type: 'rice' })
      setCoords(null)
      previousMunicipalityRef.current = null
    }
  }, [open, farm, reset])

  const handleMunicipalityChange = (value: string) => {
    const nextMunicipalityId = value ? Number(value) : null

    if (
      previousMunicipalityRef.current !== null
      && previousMunicipalityRef.current !== nextMunicipalityId
    ) {
      setValue('barangay_id', '' as unknown as number, { shouldValidate: true })
    }

    setValue('municipality_id', value ? Number(value) : ('' as unknown as number), { shouldValidate: true })
    previousMunicipalityRef.current = nextMunicipalityId
  }

  const handleBarangayChange = (value: string) => {
    setValue('barangay_id', value ? Number(value) : ('' as unknown as number), { shouldValidate: true })
  }

  const close = () => {
    reset()
    setCoords(null)
    previousMunicipalityRef.current = null
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

        <MunicipalityBarangayFields
          municipalityId={municipalityId}
          barangayId={barangayId}
          onMunicipalityChange={handleMunicipalityChange}
          onBarangayChange={handleBarangayChange}
          municipalityError={errors.municipality_id?.message}
          barangayError={errors.barangay_id?.message}
        />

        <Input label="Address (optional)" {...register('address')} />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Farm Location (GPS)</label>
          <FarmLocationPicker
            active={open}
            value={coords}
            onChange={setCoords}
          />
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
