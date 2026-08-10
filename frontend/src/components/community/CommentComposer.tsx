import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ImagePlus, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  COMMENT_IMAGE_ACCEPT,
  validateCommentImage,
} from '@/lib/commentImages'

interface CommentComposerProps {
  body: string
  replyTo: number | null
  submitting: boolean
  image: File | null
  imagePreview: string | null
  onBodyChange: (value: string) => void
  onImageChange: (file: File | null, preview: string | null) => void
  onCancelReply: () => void
  onSubmit: () => void
}

export function CommentComposer({
  body,
  replyTo,
  submitting,
  image,
  imagePreview,
  onBodyChange,
  onImageChange,
  onCancelReply,
  onSubmit,
}: CommentComposerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageError, setImageError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const canSubmit = Boolean(body.trim() || image)

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && canSubmit) {
      event.preventDefault()
      onSubmit()
    }
  }

  const handlePickImage = () => {
    setImageError(null)
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    const error = validateCommentImage(file)
    if (error) {
      setImageError(error)
      return
    }

    setImageError(null)
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }
    onImageChange(file, URL.createObjectURL(file))
  }

  const handleRemoveImage = () => {
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }
    onImageChange(null, null)
    setImageError(null)
  }

  return (
    <div className="bg-white px-4 py-3 sm:px-6">
      {replyTo && (
        <p className="mb-2 text-xs text-forest">
          Replying to a comment ·{' '}
          <button type="button" className="font-medium underline" onClick={onCancelReply}>
            Cancel
          </button>
        </p>
      )}

      {imagePreview && (
        <div className="mb-3 flex items-start gap-3 rounded-xl border border-forest/10 bg-forest/[0.03] p-3">
          <img
            src={imagePreview}
            alt={image?.name ?? 'Selected comment photo'}
            className="h-20 w-20 shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-ink">{image?.name ?? 'Photo attached'}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Tap post to share this image with your comment.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handlePickImage}
                className="text-xs font-medium text-forest hover:underline"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
              >
                <X className="h-3 w-3" /> Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {imageError && (
        <p className="mb-2 text-xs text-red-600">{imageError}</p>
      )}

      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={COMMENT_IMAGE_ACCEPT}
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={handlePickImage}
          disabled={submitting}
          className="h-11 w-11 shrink-0 rounded-full"
          aria-label="Attach photo"
        >
          <ImagePlus className="h-4 w-4" />
        </Button>

        <input
          type="text"
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={replyTo ? 'Write a reply or attach a photo…' : 'Write a comment or attach a photo…'}
          className="h-11 min-w-0 flex-1 rounded-full border border-black/10 bg-forest/[0.04] px-4 text-sm text-ink placeholder:text-muted-foreground focus-visible:border-forest-light focus-visible:outline-none"
        />

        <Button
          type="button"
          size="icon"
          onClick={onSubmit}
          loading={submitting}
          disabled={!canSubmit}
          className="h-11 w-11 shrink-0 rounded-full"
          aria-label="Post comment"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
