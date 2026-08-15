import { useState } from 'react'
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
  const [submitting, setSubmitting] = useState(false)

  const handleShare = async () => {
    if (!post) return
    setSubmitting(true)
    try {
      const { data } = await communityService.share(post.id)
      onSuccess(data.data)
      toast.success(post.shared_by_me ? 'Share updated.' : 'Shared to your profile.')
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
      description="Share this advisory to your profile so you can find it later."
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
      {post && <SharedPostPreview post={post} compact />}
    </Modal>
  )
}
