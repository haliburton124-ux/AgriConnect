import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ClipboardCheck } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { incidentService } from '@/services/incidentService'
import { getApiErrorMessage } from '@/lib/api'
import type { Incident } from '@/types'

const schema = z.object({
  inspection_notes: z.string().min(10, 'Describe what you observed on-site (min. 10 characters)'),
  treatment_recommendation: z.string().min(10, 'Provide a clear treatment or action plan'),
  follow_up_actions: z.string().optional(),
  requires_follow_up: z.boolean(),
  follow_up_date: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface AddRecommendationModalProps {
  open: boolean
  onClose: () => void
  incident: Incident | null
  onSuccess: () => void
}

/**
 * Technician's "Technician Recommendation Modal" — inspection notes,
 * treatment plan, and an optional follow-up visit date. Attachments
 * (photos of the treated field, etc.) are supported via multipart upload.
 */
export function AddRecommendationModal({ open, onClose, incident, onSuccess }: AddRecommendationModalProps) {
  const [attachments, setAttachments] = useState<File[]>([])
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { requires_follow_up: false },
  })

  const requiresFollowUp = watch('requires_follow_up')

  const onSubmit = async (values: FormValues) => {
    if (!incident) return

    const formData = new FormData()
    formData.append('inspection_notes', values.inspection_notes)
    formData.append('treatment_recommendation', values.treatment_recommendation)
    if (values.follow_up_actions) formData.append('follow_up_actions', values.follow_up_actions)
    formData.append('requires_follow_up', values.requires_follow_up ? '1' : '0')
    if (values.requires_follow_up && values.follow_up_date) formData.append('follow_up_date', values.follow_up_date)
    attachments.forEach((file) => formData.append('attachments[]', file))

    try {
      await incidentService.submitRecommendation(incident.id, formData)
      toast.success('Recommendation submitted successfully.')
      onSuccess()
      onClose()
      reset()
      setAttachments([])
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Inspection Recommendation"
      description={incident ? `${incident.reference_code} — ${incident.title}` : undefined}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
            <ClipboardCheck className="h-4 w-4" /> Submit Recommendation
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Inspection notes *</label>
          <textarea
            className="w-full rounded-xl border-2 border-input bg-white px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:border-forest-light"
            rows={3}
            placeholder="What did you observe on-site?"
            {...register('inspection_notes')}
          />
          {errors.inspection_notes && <p className="mt-1.5 text-xs text-danger">{errors.inspection_notes.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Treatment recommendation *</label>
          <textarea
            className="w-full rounded-xl border-2 border-input bg-white px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:border-forest-light"
            rows={3}
            placeholder="Recommended treatment, dosage, or corrective action…"
            {...register('treatment_recommendation')}
          />
          {errors.treatment_recommendation && <p className="mt-1.5 text-xs text-danger">{errors.treatment_recommendation.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Follow-up actions (optional)</label>
          <textarea
            className="w-full rounded-xl border-2 border-input bg-white px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:border-forest-light"
            rows={2}
            {...register('follow_up_actions')}
          />
        </div>

        <div className="flex items-center gap-2.5">
          <input type="checkbox" id="requires_follow_up" className="h-4 w-4 rounded border-2 border-input text-forest focus:ring-forest-light" {...register('requires_follow_up')} />
          <label htmlFor="requires_follow_up" className="text-sm font-medium text-ink">This case needs a follow-up visit</label>
        </div>

        {requiresFollowUp && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Follow-up date</label>
            <input type="date" className="h-11 w-full rounded-xl border-2 border-input bg-white px-4 text-sm focus-visible:outline-none focus-visible:border-forest-light" {...register('follow_up_date')} />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Attachments (optional)</label>
          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={(e) => setAttachments(Array.from(e.target.files ?? []))}
            className="block w-full text-sm text-ink/70"
          />
        </div>
      </form>
    </Modal>
  )
}
