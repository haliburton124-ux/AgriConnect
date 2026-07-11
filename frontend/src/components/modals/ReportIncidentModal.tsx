import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { MapPin, Send, Upload, X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { api, getApiErrorMessage } from '@/lib/api'
import type { IncidentCategory } from '@/types'

const schema = z.object({
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
  farmLocation?: { latitude: number; longitude: number; municipality_id: number; barangay_id: number }
}

const severityOptions = [
  { value: 'low', label: 'Low', hint: 'Minor issue, no urgent action needed' },
  { value: 'medium', label: 'Medium', hint: 'Needs attention within the week' },
  { value: 'high', label: 'High', hint: 'Needs prompt technician visit' },
  { value: 'critical', label: 'Critical', hint: 'Urgent — spreading or worsening fast' },
] as const

/**
 * The core "Report Incident" flow — a modal, not a page, per the platform's
 * UX requirement. Captures category, description, severity, GPS (auto-filled
 * from the selected farm or the browser's geolocation), and photo evidence.
 */
export function ReportIncidentModal({ open, onClose, onSuccess, farmId, farmLocation }: ReportIncidentModalProps) {
  const [categories, setCategories] = useState<IncidentCategory[]>([])
  const [photos, setPhotos] = useState<File[]>([])
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    farmLocation ? { lat: farmLocation.latitude, lng: farmLocation.longitude } : null,
  )

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { severity: 'medium', incident_date: new Date().toISOString().slice(0, 10) },
  })

  useEffect(() => {
    if (open) {
      api.get('/locations/incident-categories').then((res) => setCategories(res.data.data))
    }
  }, [open])

  const useCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => toast.error('Could not access your location. Please enable location services.'),
    )
  }

  const handlePhotoSelect = (files: FileList | null) => {
    if (!files) return
    setPhotos((prev) => [...prev, ...Array.from(files)].slice(0, 6))
  }

  const onSubmit = async (values: FormValues) => {
    if (!coords) {
      toast.error('Please set the incident location before submitting.')
      return
    }
    if (!farmLocation) {
      toast.error('Missing municipality/barangay context. Please select a farm first.')
      return
    }

    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => formData.append(key, String(value)))
    formData.append('latitude', String(coords.lat))
    formData.append('longitude', String(coords.lng))
    formData.append('municipality_id', String(farmLocation.municipality_id))
    formData.append('barangay_id', String(farmLocation.barangay_id))
    if (farmId) formData.append('farm_id', String(farmId))
    photos.forEach((file) => formData.append('photos[]', file))

    try {
      const { data } = await api.post('/farmer/incidents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success(data.message ?? 'Incident reported successfully.')
      reset()
      setPhotos([])
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not submit your report. Please try again.'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Report a Farm Incident"
      description="Give technicians the details they need to respond quickly."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
            <Send className="h-4 w-4" /> Submit Report
          </Button>
        </>
      }
    >
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
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
          <label className="mb-1.5 block text-sm font-medium text-ink">Location</label>
          <Button type="button" variant="outline" size="sm" onClick={useCurrentLocation}>
            <MapPin className="h-4 w-4" />
            {coords ? `Pinned: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : 'Use my current location'}
          </Button>
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
    </Modal>
  )
}
