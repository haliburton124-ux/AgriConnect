import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Heart, Share2, MapPin } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SharePostModal } from '@/components/modals/SharePostModal'
import { SharedPostBanner, hasSharedPostContext } from '@/components/community/SharedPostBanner'
import { SharedPostPreview } from '@/components/community/SharedPostPreview'
import { PostPhotoGrid } from '@/components/community/PostPhotoGrid'
import { CommentComposer } from '@/components/community/CommentComposer'
import { CommentThread } from '@/components/community/CommentThread'
import { EvidenceLightbox } from '@/components/ui/EvidenceLightbox'
import { communityService } from '@/services/communityService'
import { formatCategory } from '@/lib/community'
import { getCommunityPostImages } from '@/lib/communityPostImages'
import { collectCommentImages, countThreadedComments } from '@/lib/commentImages'
import { formatDateTime, cn } from '@/lib/utils'
import { getApiErrorMessage } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { CommunityPost, CommunityPostComment } from '@/types'

interface PostDetailModalProps {
  post: CommunityPost | null
  onClose: () => void
  onUpdate: (post: CommunityPost) => void
  enableEngagement?: boolean
}

export function PostDetailModal({ post, onClose, onUpdate, enableEngagement = true }: PostDetailModalProps) {
  const [comments, setComments] = useState<CommunityPostComment[] | null>(null)
  const [body, setBody] = useState('')
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [commentImage, setCommentImage] = useState<File | null>(null)
  const [commentImagePreview, setCommentImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const user = useAuthStore((s) => s.user)

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
    if (commentImagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(commentImagePreview)
    }
    setCommentImagePreview(null)

    communityService
      .get(postId, post.share_id ? { share_id: post.share_id } : undefined)
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
  }, [post?.id, post?.share_id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!post) return null

  const images = getCommunityPostImages(post)
  const isSharedView = hasSharedPostContext(post)

  const clearComposer = () => {
    setBody('')
    setReplyTo(null)
    setCommentImage(null)
    if (commentImagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(commentImagePreview)
    }
    setCommentImagePreview(null)
  }

  const handleImageChange = (file: File | null, preview: string | null) => {
    setCommentImage(file)
    setCommentImagePreview(preview)
  }

  const handleLike = async () => {
    try {
      const { data } = await communityService.like(post.id)
      onUpdate(data.data)
      toast.success(data.message)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handleShare = () => {
    setShareOpen(true)
  }

  const handleComment = async () => {
    if (!body.trim() && !commentImage) return
    setSubmitting(true)
    try {
      await communityService.addComment(post.id, {
        body: body.trim() || undefined,
        parentId: replyTo ?? undefined,
        image: commentImage ?? undefined,
      })
      const refreshed = await communityService.get(post.id)
      onUpdate(refreshed.data.data)
      const commentsRes = await communityService.comments(post.id)
      setComments(commentsRes.data.data)
      clearComposer()
      toast.success('Comment posted.')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleCommentImageClick = (commentId: number) => {
    const index = galleryImages.findIndex((image) => image.id === commentId)
    if (index < 0) return
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  return (
    <>
      <Modal
        open={Boolean(post)}
        onClose={onClose}
        title={post.title}
        size="lg"
        description={
          isSharedView && post.shared_at
            ? `Shared by ${post.shared_by?.id === user?.id ? 'you' : post.shared_by?.full_name ?? 'a farmer'} · ${formatDateTime(post.shared_at)}`
            : undefined
        }
        footer={
          enableEngagement ? (
            <CommentComposer
              body={body}
              replyTo={replyTo}
              submitting={submitting}
              image={commentImage}
              imagePreview={commentImagePreview}
              onBodyChange={setBody}
              onImageChange={handleImageChange}
              onCancelReply={() => setReplyTo(null)}
              onSubmit={handleComment}
            />
          ) : undefined
        }
      >
        <div className="space-y-5">
          {isSharedView ? (
            <>
              <SharedPostBanner post={post} viewerId={user?.id} viewerRole={user?.role} />
              <SharedPostPreview post={post} label="Original advisory" />
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="validated">{formatCategory(post.category)}</Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-forest" />
                  {post.municipality?.name}
                </span>
              </div>

              {images.length > 0 && (
                <PostPhotoGrid paths={images} variant="detail" enableLightbox />
              )}

              <div className="whitespace-pre-wrap text-sm leading-relaxed text-ink/80">{post.content}</div>
            </>
          )}

          {enableEngagement && (
            <div className="flex flex-wrap gap-2 border-y border-black/5 py-3">
              <Button size="sm" variant={post.liked_by_me ? 'primary' : 'outline'} onClick={handleLike}>
                <Heart className={cn('h-4 w-4', post.liked_by_me && 'fill-current')} />
                {post.likes_count} Likes
              </Button>
              <Button size="sm" variant={post.shared_by_me ? 'primary' : 'outline'} onClick={handleShare}>
                <Share2 className="h-4 w-4" /> {post.shared_by_me ? 'Shared' : 'Share'}
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

            <div className="mt-4 space-y-4">
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
                    onImageClick={handleCommentImageClick}
                    canReply={enableEngagement}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </Modal>

      <SharePostModal
        post={shareOpen ? post : null}
        onClose={() => setShareOpen(false)}
        onSuccess={onUpdate}
      />

      <EvidenceLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={galleryImages}
        initialIndex={lightboxIndex}
      />
    </>
  )
}
