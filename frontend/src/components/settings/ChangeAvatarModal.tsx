import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Camera } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { getApiErrorMessage } from '@/lib/api'

const ACCEPT = 'image/jpeg,image/png,image/webp'
const MAX_BYTES = 5 * 1024 * 1024

export function ChangeAvatarModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) {
      setFile(null)
      setPreview(null)
    }
  }, [open])

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  if (!user) return null

  const pickFile = (files: FileList | null) => {
    const next = files?.[0]
    if (!next) return
    if (next.size > MAX_BYTES) {
      toast.error('Choose a photo under 5 MB.')
      return
    }
    if (preview) URL.revokeObjectURL(preview)
    setFile(next)
    setPreview(URL.createObjectURL(next))
  }

  const handleSave = async () => {
    if (!file) return
    setSaving(true)
    try {
      const { data } = await authService.updateAvatar(file)
      updateUser(data.user)
      toast.success('Profile photo updated.')
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Profile photo"
      description="JPG, PNG, or WebP · max 5 MB. This photo is shown on your technician profile."
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} loading={saving} disabled={!file}>Save photo</Button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-5">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
        >
          {preview ? (
            <img src={preview} alt="" className="h-24 w-24 rounded-3xl object-cover" />
          ) : (
            <UserAvatar user={user} size="lg" className="bg-forest/10 text-forest" />
          )}
          <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-forest text-white shadow-card">
            <Camera className="h-4 w-4" />
          </span>
        </button>
        <p className="text-center text-sm text-muted-foreground">
          Tap the photo to choose a new one, then save.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => pickFile(e.target.files)}
        />
      </div>
    </Modal>
  )
}
