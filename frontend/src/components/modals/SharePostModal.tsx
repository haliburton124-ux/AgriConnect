import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { SharedPostPreview } from '@/components/community/SharedPostPreview'
import { communityService } from '@/services/communityService'
import { getApiErrorMessage } from '@/lib/api'
import type { CommunityPost } from '@/types'

interface SharePostModalProps {
  post: CommunityPost | null
  onClose: () => void
  onSuccess: (post: CommunityPost) => void
}

export function SharePostModal({ post, onClose, onSuccess }: SharePostModalProps) {
  const [caption, setCaption] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!post) {
      setCaption('')
      return
    }
    setCaption(post.share_caption ?? '')
  }, [post])

  const handleShare = async () => {
    if (!post) return
    setSubmitting(true)
    try {
      const trimmed = caption.trim()
      const { data } = await communityService.share(post.id, trimmed || undefined)
      onSuccess(data.data)
      toast.success(post.shared_by_me ? 'Share updated.' : 'Shared to your feed.')
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={Boolean(post)}
      onClose={onClose}
      title="Share Post"
      description="Add an optional message before sharing this advisory to your feed."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleShare} loading={submitting}>
            {post?.shared_by_me ? 'Update share' : 'Share'}
          </Button>
        </>
      }
    >
      {post && (
        <div className="space-y-4">
          <div>
            <label htmlFor="share-caption" className="mb-1.5 block text-sm font-medium text-ink">
              Your caption <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="share-caption"
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={500}
              placeholder="Say something about this post…"
              className="w-full rounded-xl border-2 border-input bg-white px-4 py-3 text-sm text-ink placeholder:text-muted-foreground focus-visible:border-forest-light focus-visible:outline-none"
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">{caption.length}/500</p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Original post
            </p>
            <SharedPostPreview post={post} compact />
          </div>
        </div>
      )}
    </Modal>
  )
}
