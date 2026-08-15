import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Heart, Share2, MapPin } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CommentComposer } from '@/components/community/CommentComposer'
import { CommentThread } from '@/components/community/CommentThread'
import { communityService } from '@/services/communityService'
import { formatCategory } from '@/lib/community'
import { collectCommentImages, countThreadedComments } from '@/lib/commentImages'
import { cn, storageUrl } from '@/lib/utils'
import { getApiErrorMessage } from '@/lib/api'
import type { CommunityPost, CommunityPostComment } from '@/types'

interface PostDetailModalProps {
  post: CommunityPost | null
  onClose: () => void
  onUpdate: (post: CommunityPost) => void
  enableEngagement?: boolean
}

function clearImageSelection(
  setImage: (file: File | null) => void,
  setPreview: (preview: string | null) => void,
  preview: string | null,
) {
  if (preview?.startsWith('blob:')) {
    URL.revokeObjectURL(preview)
  }
  setImage(null)
  setPreview(null)
}

export function PostDetailModal({ post, onClose, onUpdate, enableEngagement = true }: PostDetailModalProps) {
  const [comments, setComments] = useState<CommunityPostComment[] | null>(null)
  const [body, setBody] = useState('')
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [commentImage, setCommentImage] = useState<File | null>(null)
  const [commentImagePreview, setCommentImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const galleryImages = useMemo(
    () => (comments ? collectCommentImages(comments) : []),
    [comments],
  )

  useEffect(() => {
    if (!post) {
      setComments(null)
      return
    }

    let cancelled = false
    const postId = post.id

    setComments(null)
    setBody('')
    setReplyTo(null)
    setCommentImage(null)
    setCommentImagePreview((prev) => {
      if (prev?.startsWith('blob:')) {
        URL.revokeObjectURL(prev)
      }
      return null
    })

    communityService
      .get(postId)
      .then((res) => {
        if (!cancelled) onUpdate(res.data.data)
      })
      .catch(() => {})

    communityService
      .comments(postId)
      .then((res) => {
        if (!cancelled) setComments(res.data.data)
      })
      .catch(() => {
        if (!cancelled) setComments([])
      })

    return () => {
      cancelled = true
    }
  }, [post?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!post) return null

  const handleLike = async () => {
    try {
      const { data } = await communityService.like(post.id)
      onUpdate(data.data)
      toast.success(data.message)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handleShare = async () => {
    try {
      const { data } = await communityService.share(post.id)
      onUpdate(data.data)
      toast.success('Shared to your feed.')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handleComment = async () => {
    if (!body.trim() && !commentImage) return
    setSubmitting(true)
    try {
      await communityService.addComment(
        post.id,
        body.trim(),
        replyTo ?? undefined,
        commentImage ?? undefined,
      )
      const refreshed = await communityService.get(post.id)
      onUpdate(refreshed.data.data)
      const commentsRes = await communityService.comments(post.id)
      setComments(commentsRes.data.data)
      setBody('')
      setReplyTo(null)
      clearImageSelection(setCommentImage, setCommentImagePreview, commentImagePreview)
      toast.success('Comment posted.')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleImageClick = (commentId: number) => {
    const image = galleryImages.find((item) => item.id === commentId)
    if (image) {
      window.open(image.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Modal
      open={Boolean(post)}
      onClose={onClose}
      title={post.title}
      size="lg"
      description={post.is_shared_in_feed ? `Originally posted by ${post.municipality?.name}` : undefined}
      footer={
        enableEngagement ? (
          <CommentComposer
            body={body}
            replyTo={replyTo}
            submitting={submitting}
            image={commentImage}
            imagePreview={commentImagePreview}
            onBodyChange={setBody}
            onImageChange={(file, preview) => {
              if (commentImagePreview?.startsWith('blob:')) {
                URL.revokeObjectURL(commentImagePreview)
              }
              setCommentImage(file)
              setCommentImagePreview(preview)
            }}
            onCancelReply={() => setReplyTo(null)}
            onSubmit={handleComment}
          />
        ) : undefined
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="validated">{formatCategory(post.category)}</Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-forest" />
            {post.municipality?.name}
          </span>
        </div>

        {post.image_path && (
          <div className="overflow-hidden rounded-xl border border-black/5">
            <img
              src={storageUrl(post.image_path)}
              alt=""
              className="max-h-80 w-full object-cover"
            />
          </div>
        )}

        <div className="whitespace-pre-wrap text-sm leading-relaxed text-ink/80">{post.content}</div>

        {enableEngagement && (
          <div className="flex flex-wrap gap-2 border-y border-black/5 py-3">
            <Button size="sm" variant={post.liked_by_me ? 'primary' : 'outline'} onClick={handleLike}>
              <Heart className={cn('h-4 w-4', post.liked_by_me && 'fill-current')} />
              {post.likes_count} Likes
            </Button>
            <Button size="sm" variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4" /> {post.shares_count} Shares
            </Button>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-ink">
            Community Discussion ({comments ? countThreadedComments(comments) : post.comments_count})
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Farmer comments and replies appear below the original municipal advisory.
          </p>

          <div className="mt-4 max-h-[min(24rem,50vh)] space-y-4 overflow-y-auto pr-1">
            {comments === null ? (
              <div className="space-y-2">
                {[1, 2].map((i) => <div key={i} className="skeleton h-16 w-full rounded-xl" />)}
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment.</p>
            ) : (
              comments.map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  galleryImages={galleryImages}
                  onReply={setReplyTo}
                  onImageClick={handleImageClick}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
