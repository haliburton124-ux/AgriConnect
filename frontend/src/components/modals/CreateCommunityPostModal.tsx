import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { communityService } from '@/services/communityService'
import { getApiErrorMessage } from '@/lib/api'
import type { CommunityPostCategory, UserRole } from '@/types'

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
  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!open) return
    communityService.categories().then((res) => setCategories(res.data.data))
    reset({ category: 'general' })
    setImage(null)
    setPreviewUrl(null)
  }, [open, reset])

  useEffect(() => {
    if (!image) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(image)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [image])

  const handleImageSelect = (files: FileList | null) => {
    if (!files?.length) return
    const file = files[0]
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5 MB or smaller.')
      return
    }
    setImage(file)
  }

  const handleClose = () => {
    setImage(null)
    onClose()
  }

  const onSubmit = async (values: FormValues) => {
    try {
      await communityService.create(
        {
          ...values,
          category: values.category as CommunityPostCategory,
          is_published: true,
          image: image ?? undefined,
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
          <label className="mb-1.5 block text-sm font-medium text-ink">Photo (optional)</label>
          {previewUrl ? (
            <div className="relative overflow-hidden rounded-xl border border-black/10">
              <img src={previewUrl} alt="Post preview" className="max-h-64 w-full object-cover" />
              <div className="absolute right-2 top-2 flex gap-2">
                <label className="cursor-pointer rounded-full bg-ink/60 px-3 py-1.5 text-xs font-medium text-white hover:bg-ink/80">
                  Replace
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleImageSelect(e.target.files)}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="rounded-full bg-ink/60 p-1.5 text-white hover:bg-ink/80"
                  aria-label="Remove photo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-forest-light/40 bg-forest/[0.02] px-4 py-6 text-center hover:border-forest-light">
              <Upload className="h-6 w-6 text-forest" />
              <span className="mt-2 text-sm text-muted-foreground">Tap to upload a photo</span>
              <span className="mt-1 text-xs text-muted-foreground">JPG, PNG, or WebP · max 5 MB</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleImageSelect(e.target.files)}
              />
            </label>
          )}
        </div>
      </div>
    </Modal>
  )
}
