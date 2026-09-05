import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileText, ImagePlus, Paperclip, X } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { knowledgeService } from '@/services/knowledgeService'
import { getApiErrorMessage } from '@/lib/api'
import type { KnowledgeCategory } from '@/types'

const schema = z.object({
  title: z.string().min(5, 'Enter a clear title'),
  content: z.string().min(20, 'Add enough detail for farmers (min. 20 characters)'),
  category_id: z.string().optional(),
  type: z.enum(['article', 'video', 'faq', 'pdf_guide']),
  video_url: z.string().url().optional().or(z.literal('')),
  published_at: z.string().optional(),
  is_published: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface CreateKnowledgeArticleModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  municipalityName?: string | null
}

export function CreateKnowledgeArticleModal({
  open,
  onClose,
  onSuccess,
  municipalityName,
}: CreateKnowledgeArticleModalProps) {
  const [categories, setCategories] = useState<KnowledgeCategory[]>([])
  const [images, setImages] = useState<File[]>([])
  const [files, setFiles] = useState<File[]>([])
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'article', is_published: true },
  })
  const type = watch('type')

  useEffect(() => {
    if (!open) return
    knowledgeService.categories().then((res) => setCategories(res.data.data))
    reset({ type: 'article', is_published: true, title: '', content: '', category_id: '', video_url: '', published_at: '' })
    setImages([])
    setFiles([])
  }, [open, reset])

  const handleClose = () => {
    setImages([])
    setFiles([])
    onClose()
  }

  const addImages = (list: FileList | null) => {
    if (!list) return
    setImages((current) => [...current, ...Array.from(list)].slice(0, 6))
  }

  const addFiles = (list: FileList | null) => {
    if (!list) return
    setFiles((current) => [...current, ...Array.from(list)].slice(0, 5))
  }

  const onSubmit = async (values: FormValues) => {
    try {
      await knowledgeService.create({
        title: values.title,
        content: values.content,
        category_id: values.category_id ? Number(values.category_id) : undefined,
        type: values.type,
        video_url: values.video_url || undefined,
        published_at: values.published_at || undefined,
        is_published: values.is_published,
        cover_image: images[0],
        images: images.slice(1),
        attachments: files,
        pdf_file: values.type === 'pdf_guide' ? files.find((f) => f.type === 'application/pdf') : undefined,
      })
      toast.success(`Published for farmers in ${municipalityName ?? 'your municipality'}.`)
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
      title="Create Knowledge Center post"
      description={`This post will only be visible to farmers registered in ${municipalityName ?? 'your municipality'}. The municipality cannot be changed.`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>Publish</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-forest/15 bg-forest/[0.04] px-4 py-3 text-sm text-ink/80">
          Publishing to <span className="font-semibold text-forest">{municipalityName ?? 'your assigned municipality'}</span>
        </div>

        <Input label="Title" error={errors.title?.message} {...register('title')} placeholder="e.g. Rice production guide for wet season" />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Category</label>
            <select className="h-11 w-full rounded-xl border-2 border-input bg-white px-4 text-sm focus-visible:border-forest-light focus-visible:outline-none" {...register('category_id')}>
              <option value="">Select a category</option>
              {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Type</label>
            <select className="h-11 w-full rounded-xl border-2 border-input bg-white px-4 text-sm focus-visible:border-forest-light focus-visible:outline-none" {...register('type')}>
              <option value="article">Article</option>
              <option value="video">Video</option>
              <option value="faq">FAQ</option>
              <option value="pdf_guide">PDF Guide</option>
            </select>
          </div>
        </div>

        {type === 'video' && (
          <Input label="Video URL" error={errors.video_url?.message} {...register('video_url')} placeholder="https://" />
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Content</label>
          <textarea
            rows={8}
            className="w-full rounded-xl border-2 border-input bg-white px-4 py-3 text-sm focus-visible:border-forest-light focus-visible:outline-none"
            placeholder="Write practical guidance farmers can follow…"
            {...register('content')}
          />
          {errors.content && <p className="mt-1 text-xs text-danger">{errors.content.message}</p>}
        </div>

        <Input
          label="Publication date"
          type="datetime-local"
          {...register('published_at')}
        />

        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" className="h-4 w-4 rounded border-input" defaultChecked {...register('is_published')} />
          Publish now (uncheck to save as draft)
        </label>

        <div>
          <p className="mb-1.5 text-sm font-medium text-ink">Images</p>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-forest-light/40 bg-forest/[0.02] px-4 py-5 text-sm text-muted-foreground hover:border-forest-light">
            <ImagePlus className="h-4 w-4 text-forest" /> Add photos (up to 6)
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addImages(e.target.files)} />
          </label>
          {images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {images.map((file, i) => (
                <div key={`${file.name}-${i}`} className="relative h-16 w-16 overflow-hidden rounded-lg">
                  <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
                  <button type="button" className="absolute right-0.5 top-0.5 rounded-full bg-ink/70 p-0.5 text-white" onClick={() => setImages((c) => c.filter((_, idx) => idx !== i))}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-ink">Attachments</p>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/10 px-4 py-5 text-sm text-muted-foreground hover:border-forest-light">
            <Paperclip className="h-4 w-4 text-forest" /> PDF, Word, or Excel (up to 5)
            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
          </label>
          {files.length > 0 && (
            <ul className="mt-2 space-y-1">
              {files.map((file, i) => (
                <li key={`${file.name}-${i}`} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 truncate"><FileText className="h-4 w-4 text-forest" /> {file.name}</span>
                  <button type="button" onClick={() => setFiles((c) => c.filter((_, idx) => idx !== i))}><X className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  )
}
