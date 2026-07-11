import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!open) return
    communityService.categories().then((res) => setCategories(res.data.data))
    reset({ category: 'general' })
  }, [open, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      await communityService.create(
        { ...values, category: values.category as CommunityPostCategory, is_published: true },
        rolePrefix(role),
      )
      toast.success('Public agricultural advisory published.')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Publish Public Advisory"
      description="This will be visible to farmers from all municipalities across Ilocos Norte."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
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
      </div>
    </Modal>
  )
}
