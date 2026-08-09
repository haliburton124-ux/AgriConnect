import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PostPhotoGrid } from '@/components/community/PostPhotoGrid'
import { communityService } from '@/services/communityService'
import { getApiErrorMessage } from '@/lib/api'
import type { CommunityPostCategory, UserRole } from '@/types'

const MAX_PHOTOS = 10
const MAX_FILE_SIZE = 5 * 1024 * 1024

const schema = z.object({
  title: z.string().min(5, 'Enter a title'),
  content: z.string().min(20, 'Provide enough detail for farmers (min. 20 characters)'),
  category: z.string().min(1, 'Select a category'),
})

type FormValues = z.infer<typeof schema>

interface CreateCommunityPostModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  role: UserRole
}

function rolePrefix(role: UserRole): 'mao' | 'ppo' | 'admin' {
  if (role === 'municipal_office') return 'mao'
  if (role === 'provincial_office') return 'ppo'
  return 'admin'
}

export function CreateCommunityPostModal({ open, onClose, onSuccess, role }: CreateCommunityPostModalProps) {
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([])
  const [photos, setPhotos] = useState<File[]>([])
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const previewUrls = useMemo(
    () => photos.map((file) => URL.createObjectURL(file)),
    [photos],
  )

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previewUrls])

  useEffect(() => {
    if (!open) return
    communityService.categories().then((res) => setCategories(res.data.data))
    reset({ category: 'general' })
    setPhotos([])
  }, [open, reset])

  const handlePhotoSelect = (files: FileList | null) => {
    if (!files?.length) return

    const valid: File[] = []
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select image files only.')
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error('Each image must be 5 MB or smaller.')
        return
      }
      valid.push(file)
    }

    setPhotos((prev) => [...prev, ...valid].slice(0, MAX_PHOTOS))
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleClose = () => {
    setPhotos([])
    onClose()
  }

  const onSubmit = async (values: FormValues) => {
    try {
      await communityService.create(
        {
          ...values,
          category: values.category as CommunityPostCategory,
          is_published: true,
          images: photos.length > 0 ? photos : undefined,
        },
        rolePrefix(role),
      )
      toast.success('Public agricultural advisory published.')
      onSuccess()
      handleClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Publish Public Advisory"
      description="This will be visible to farmers from all municipalities across Ilocos Norte."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>Publish</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Title" error={errors.title?.message} {...register('title')} placeholder="e.g. Proper pesticide application for rice fields" />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Category</label>
          <select
            className="h-11 w-full rounded-xl border-2 border-input bg-white px-4 text-sm focus-visible:outline-none focus-visible:border-forest-light"
            {...register('category')}
          >
            {categories.map((cat) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
          </select>
          {errors.category && <p className="mt-1 text-xs text-danger">{errors.category.message}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Content</label>
          <textarea
            rows={8}
            className="w-full rounded-xl border-2 border-input bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-forest-light"
            placeholder="Share educational guidance, best practices, or advisories for farmers…"
            {...register('content')}
          />
          {errors.content && <p className="mt-1 text-xs text-danger">{errors.content.message}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Photos (optional{photos.length > 0 ? ` · ${photos.length}/${MAX_PHOTOS}` : ''})
          </label>

          {previewUrls.length > 0 ? (
            <div className="space-y-3">
              <PostPhotoGrid paths={previewUrls} variant="detail" />
              <div className="flex flex-wrap gap-2">
                {photos.length < MAX_PHOTOS && (
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-forest/20 bg-forest/[0.04] px-3 py-1.5 text-xs font-medium text-forest hover:bg-forest/[0.08]">
                    <Upload className="h-3.5 w-3.5" />
                    Add more
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                      onChange={(e) => handlePhotoSelect(e.target.files)}
                    />
                  </label>
                )}
                <button
                  type="button"
                  onClick={() => setPhotos([])}
                  className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-black/[0.04]"
                >
                  <X className="h-3.5 w-3.5" />
                  Remove all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {photos.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-2 py-1 text-xs">
                    <span className="max-w-[140px] truncate text-ink/70">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="text-muted-foreground hover:text-danger"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-forest-light/40 bg-forest/[0.02] px-4 py-6 text-center hover:border-forest-light">
              <Upload className="h-6 w-6 text-forest" />
              <span className="mt-2 text-sm text-muted-foreground">Tap to upload photos</span>
              <span className="mt-1 text-xs text-muted-foreground">JPG, PNG, or WebP · up to {MAX_PHOTOS} photos · max 5 MB each</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => handlePhotoSelect(e.target.files)}
              />
            </label>
          )}
        </div>
      </div>
    </Modal>
  )
}
