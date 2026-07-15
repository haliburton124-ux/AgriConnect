import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Send, Upload, X, Sprout, AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AgriMap } from '@/components/map'
import { api, getApiErrorMessage } from '@/lib/api'
import { farmService } from '@/services/farmService'
import { FARM_REGISTRATION_REQUIRED_MESSAGE, getGeolocatedFarms } from '@/lib/farms'
import type { Farm, IncidentCategory } from '@/types'

const schema = z.object({
  farm_id: z.coerce.number().min(1, 'Select the farm where this incident occurred'),
  category_id: z.coerce.number().min(1, 'Select a category'),
  title: z.string().min(5, 'Give your report a short, clear title'),
  description: z.string().min(20, 'Please describe the issue in more detail (min. 20 characters)'),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  incident_date: z.string().min(1, 'Select the date this happened'),
  remarks: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface ReportIncidentModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  farmId?: number
}

const severityOptions = [
  { value: 'low', label: 'Low', hint: 'Minor issue, no urgent action needed' },
  { value: 'medium', label: 'Medium', hint: 'Needs attention within the week' },
  { value: 'high', label: 'High', hint: 'Needs prompt technician visit' },
  { value: 'critical', label: 'Critical', hint: 'Urgent — spreading or worsening fast' },
] as const

export function ReportIncidentModal({ open, onClose, onSuccess, farmId }: ReportIncidentModalProps) {
  const [categories, setCategories] = useState<IncidentCategory[]>([])
  const [farms, setFarms] = useState<Farm[] | null>(null)
  const [farmsLoading, setFarmsLoading] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { severity: 'medium', incident_date: new Date().toISOString().slice(0, 10) },
  })

  const selectedFarmId = watch('farm_id')

  useEffect(() => {
    if (!open) return

    api.get('/locations/incident-categories').then((res) => setCategories(res.data.data))

    setFarmsLoading(true)
    farmService.list()
      .then((res) => setFarms(getGeolocatedFarms(res.data.data)))
      .catch(() => setFarms([]))
      .finally(() => setFarmsLoading(false))
  }, [open])

  useEffect(() => {
    if (!open || !farms?.length) return

    const preferredFarm = farmId
      ? farms.find((farm) => farm.id === farmId)
      : farms[0]

    if (preferredFarm) {
      setValue('farm_id', preferredFarm.id)
      setCoords({ lat: preferredFarm.latitude, lng: preferredFarm.longitude })
    }
  }, [open, farms, farmId, setValue])

  useEffect(() => {
    if (!selectedFarmId || !farms?.length) return
    const farm = farms.find((item) => item.id === Number(selectedFarmId))
    if (farm) {
      setCoords({ lat: farm.latitude, lng: farm.longitude })
    }
  }, [selectedFarmId, farms])

  const handlePhotoSelect = (files: FileList | null) => {
    if (!files) return
    setPhotos((prev) => [...prev, ...Array.from(files)].slice(0, 6))
  }

  const handleClose = () => {
    reset({ severity: 'medium', incident_date: new Date().toISOString().slice(0, 10) })
    setPhotos([])
    setCoords(null)
    setFarms(null)
    onClose()
  }

  const onSubmit = async (values: FormValues) => {
    if (!coords) {
      toast.error('Please set the incident location before submitting.')
      return
    }

    const farm = farms?.find((item) => item.id === values.farm_id)
    if (!farm?.municipality?.id || !farm.barangay?.id) {
      toast.error('The selected farm is missing municipality or barangay details.')
      return
    }

    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => formData.append(key, String(value)))
    formData.append('latitude', String(coords.lat))
    formData.append('longitude', String(coords.lng))
    formData.append('municipality_id', String(farm.municipality.id))
    formData.append('barangay_id', String(farm.barangay.id))
    photos.forEach((file) => formData.append('photos[]', file))

    try {
      const { data } = await api.post('/farmer/incidents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success(data.message ?? 'Incident reported successfully.')
      reset()
      setPhotos([])
      onSuccess()
      handleClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not submit your report. Please try again.'))
    }
  }

  const hasRegisteredFarm = Boolean(farms?.length)

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Report a Farm Incident"
      description={hasRegisteredFarm ? 'Give technicians the details they need to respond quickly.' : undefined}
      size="lg"
      footer={
        hasRegisteredFarm ? (
          <>
            <Button variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
              <Send className="h-4 w-4" /> Submit Report
            </Button>
          </>
        ) : (
          <Button variant="ghost" onClick={handleClose}>Close</Button>
        )
      }
    >
      {farmsLoading ? (
        <div className="space-y-3 py-6">
          <div className="skeleton h-24 w-full rounded-2xl" />
          <div className="skeleton h-10 w-full rounded-xl" />
        </div>
      ) : !hasRegisteredFarm ? (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 text-gold">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-ink">Farm registration required</h3>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              {FARM_REGISTRATION_REQUIRED_MESSAGE}
            </p>
          </div>
          <Link to="/farmer/farms" onClick={handleClose}>
            <Button>
              <Sprout className="h-4 w-4" /> Register a Farm
            </Button>
          </Link>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Farm</label>
            <select
              className="h-11 w-full rounded-xl border-2 border-input bg-white px-4 text-sm focus-visible:outline-none focus-visible:border-forest-light"
              {...register('farm_id')}
            >
              <option value="">Select farm…</option>
              {farms!.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.farm_name} — Brgy. {farm.barangay?.name}, {farm.municipality?.name}
                </option>
              ))}
            </select>
            {errors.farm_id && <p className="mt-1.5 text-xs text-danger">{errors.farm_id.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Category</label>
            <Controller
              control={control}
              name="category_id"
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => field.onChange(cat.id)}
                      className={`rounded-xl border-2 px-2 py-3 text-center text-xs font-medium transition-all ${
                        field.value === cat.id
                          ? 'border-forest bg-forest/5 text-forest'
                          : 'border-input text-ink/70 hover:border-forest-light'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.category_id && <p className="mt-1.5 text-xs text-danger">{errors.category_id.message}</p>}
          </div>

          <Input label="Title" placeholder="e.g. Rice blast affecting 2 hectares" error={errors.title?.message} {...register('title')} />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Description</label>
            <textarea
              rows={4}
              placeholder="Describe what you're observing — symptoms, affected area, timeline..."
              className="w-full rounded-xl border-2 border-input bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-forest-light"
              {...register('description')}
            />
            {errors.description && <p className="mt-1.5 text-xs text-danger">{errors.description.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Severity</label>
            <Controller
              control={control}
              name="severity"
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {severityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      title={opt.hint}
                      onClick={() => field.onChange(opt.value)}
                      className={`rounded-xl border-2 px-3 py-2 text-sm font-medium transition-all ${
                        field.value === opt.value
                          ? opt.value === 'critical' ? 'border-danger bg-danger/5 text-danger'
                          : opt.value === 'high' ? 'border-[#EF6C00] bg-[#EF6C00]/5 text-[#EF6C00]'
                          : opt.value === 'medium' ? 'border-gold bg-gold/5 text-gold'
                          : 'border-success bg-success/5 text-success'
                          : 'border-input text-ink/70 hover:border-forest-light'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          <Input label="Date observed" type="date" error={errors.incident_date?.message} {...register('incident_date')} />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Incident GPS location</label>
            <AgriMap
              active={open}
              value={coords}
              onChange={setCoords}
              interactive
              showGpsButton
              showSearch
              showCoordinates
              scrollWheelZoom={false}
              hint="Tap the map or drag the marker to pinpoint where the incident occurred."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Photos (up to 6)</label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-forest-light/40 bg-forest/[0.02] px-4 py-6 text-center hover:border-forest-light">
              <Upload className="h-6 w-6 text-forest" />
              <span className="mt-2 text-sm text-muted-foreground">Tap to upload or take a photo</span>
              <input type="file" accept="image/*" multiple capture="environment" className="hidden" onChange={(e) => handlePhotoSelect(e.target.files)} />
            </label>

            {photos.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {photos.map((file, i) => (
                  <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-black/10">
                    <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute right-0.5 top-0.5 rounded-full bg-ink/60 p-0.5 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Input label="Additional remarks (optional)" placeholder="Anything else technicians should know?" {...register('remarks')} />
        </form>
      )}
    </Modal>
  )
}
