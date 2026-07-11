import { useState } from 'react'
import { toast } from 'sonner'
import { Upload } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { getApiErrorMessage } from '@/lib/api'
import { programService } from '@/services/programService'
import type { Program } from '@/types'

interface ApplyProgramModalProps {
  open: boolean
  onClose: () => void
  program: Program | null
  onSuccess: () => void
}

export function ApplyProgramModal({ open, onClose, program, onSuccess }: ApplyProgramModalProps) {
  const [remarks, setRemarks] = useState('')
  const [documents, setDocuments] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)

  const close = () => {
    setRemarks('')
    setDocuments([])
    onClose()
  }

  const handleSubmit = async () => {
    if (!program) return
    setSubmitting(true)
    const formData = new FormData()
    if (remarks) formData.append('remarks', remarks)
    documents.forEach((file) => formData.append('documents[]', file))

    try {
      await programService.apply(program.id, formData)
      toast.success('Application submitted successfully.')
      onSuccess()
      close()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Apply for Program"
      description={program?.title}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={close}>Cancel</Button>
          <Button onClick={handleSubmit} loading={submitting}>Submit Application</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Remarks (optional)</label>
          <textarea
            className="w-full rounded-xl border-2 border-input bg-white px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:border-forest-light"
            rows={3}
            placeholder="Anything the reviewing office should know…"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Supporting Documents (optional)</label>
          <label className={cn(
            'flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed py-5 text-sm transition-colors',
            documents.length > 0 ? 'border-forest bg-forest/5 text-forest' : 'border-forest-light/40 bg-forest/[0.02] text-forest hover:bg-forest/5',
          )}>
            <Upload className="h-4 w-4" />
            {documents.length > 0 ? `${documents.length} file(s) selected` : 'Attach supporting documents'}
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => setDocuments(Array.from(e.target.files ?? []).slice(0, 5))}
            />
          </label>
        </div>
      </div>
    </Modal>
  )
}
