import { useState } from 'react'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getApiErrorMessage } from '@/lib/api'
import { announcementService } from '@/services/announcementService'
import { useAuthStore } from '@/store/authStore'

const AUDIENCES = [
  { value: 'all', label: 'Everyone' },
  { value: 'farmers', label: 'Farmers only' },
  { value: 'technicians', label: 'Technicians only' },
] as const

interface CreateAnnouncementModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateAnnouncementModal({ open, onClose, onSuccess }: CreateAnnouncementModalProps) {
  const { user } = useAuthStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [audience, setAudience] = useState<'all' | 'farmers' | 'technicians'>('all')
  const [submitting, setSubmitting] = useState(false)

  const close = () => {
    setTitle('')
    setContent('')
    setAudience('all')
    onClose()
  }

  const handleSubmit = async () => {
    if (!title || !content) {
      toast.error('Please fill in both the title and content.')
      return
    }
    setSubmitting(true)
    const formData = new FormData()
    formData.append('title', title)
    formData.append('content', content)
    formData.append('audience', audience)
    formData.append('is_published', '1')

    try {
      await announcementService.create(user!.role, formData)
      toast.success('Announcement posted successfully.')
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
      title="New Announcement"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={close}>Cancel</Button>
          <Button onClick={handleSubmit} loading={submitting}>Post Announcement</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Content</label>
          <textarea
            className="w-full rounded-xl border-2 border-input bg-white px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:border-forest-light"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Audience</label>
          <select
            className="h-11 w-full rounded-xl border-2 border-input bg-white px-4 text-sm focus-visible:outline-none focus-visible:border-forest-light"
            value={audience}
            onChange={(e) => setAudience(e.target.value as typeof audience)}
          >
            {AUDIENCES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>
      </div>
    </Modal>
  )
}
