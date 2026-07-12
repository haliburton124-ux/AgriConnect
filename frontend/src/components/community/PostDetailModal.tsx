import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Heart, Share2, MapPin, Reply } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { communityService } from '@/services/communityService'
import { formatCategory } from '@/lib/community'
import { formatDateTime, cn } from '@/lib/utils'
import { getApiErrorMessage } from '@/lib/api'
import type { CommunityPost, CommunityPostComment } from '@/types'

interface PostDetailModalProps {
  post: CommunityPost | null
  onClose: () => void
  onUpdate: (post: CommunityPost) => void
  enableEngagement?: boolean
}

function commentReplies(comment: CommunityPostComment): CommunityPostComment[] {
  const replies = comment.replies
  if (!replies) return []
  if (Array.isArray(replies)) return replies
  const wrapped = replies as { data?: CommunityPostComment[] }
  return Array.isArray(wrapped.data) ? wrapped.data : []
}

function CommentThread({
  comment,
  onReply,
}: {
  comment: CommunityPostComment
  onReply: (parentId: number) => void
}) {
  return (
    <div className={cn('space-y-3', comment.parent_id && 'ml-6 border-l-2 border-forest/10 pl-4')}>
      <div className="rounded-xl bg-forest/[0.03] p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-ink">{comment.user?.full_name ?? 'Farmer'}</p>
          <p className="text-[11px] text-muted-foreground">{formatDateTime(comment.created_at)}</p>
        </div>
        <p className="mt-1 text-sm text-ink/80">{comment.body}</p>
        <button
          type="button"
          onClick={() => onReply(comment.id)}
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-forest hover:underline"
        >
          <Reply className="h-3 w-3" /> Reply
        </button>
      </div>
      {commentReplies(comment).map((reply) => (
        <CommentThread key={reply.id} comment={reply} onReply={onReply} />
      ))}
    </div>
  )
}

export function PostDetailModal({ post, onClose, onUpdate, enableEngagement = true }: PostDetailModalProps) {
  const [comments, setComments] = useState<CommunityPostComment[] | null>(null)
  const [body, setBody] = useState('')
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!post) return
    setComments(null)
    communityService.get(post.id).then((res) => onUpdate(res.data.data)).catch(() => {})
    communityService.comments(post.id).then((res) => setComments(res.data.data))
    setBody('')
    setReplyTo(null)
  }, [post]) // eslint-disable-line react-hooks/exhaustive-deps

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
    if (!body.trim()) return
    setSubmitting(true)
    try {
      await communityService.addComment(post.id, body.trim(), replyTo ?? undefined)
      const refreshed = await communityService.get(post.id)
      onUpdate(refreshed.data.data)
      const commentsRes = await communityService.comments(post.id)
      setComments(commentsRes.data.data)
      setBody('')
      setReplyTo(null)
      toast.success('Comment posted.')
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
      title={post.title}
      size="lg"
      description={post.is_shared_in_feed ? `Originally posted by ${post.municipality?.name}` : undefined}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="validated">{formatCategory(post.category)}</Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-forest" />
            {post.municipality?.name}
          </span>
        </div>

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

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-ink">Comments ({post.comments_count})</h4>

          {enableEngagement && (
            <div className="space-y-2">
              {replyTo && (
                <p className="text-xs text-forest">
                  Replying to a comment ·{' '}
                  <button type="button" className="underline" onClick={() => setReplyTo(null)}>Cancel</button>
                </p>
              )}
              <Input
                placeholder={replyTo ? 'Write a reply…' : 'Join the discussion…'}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              <Button size="sm" onClick={handleComment} loading={submitting} disabled={!body.trim()}>
                Post Comment
              </Button>
            </div>
          )}

          {comments === null ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <div key={i} className="skeleton h-16 w-full rounded-xl" />)}
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet. Start the conversation.</p>
          ) : (
            comments.map((comment) => (
              <CommentThread key={comment.id} comment={comment} onReply={setReplyTo} />
            ))
          )}
        </div>
      </div>
    </Modal>
  )
}
