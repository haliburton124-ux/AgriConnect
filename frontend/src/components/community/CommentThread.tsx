import { Reply } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { commentRepliesList, type CommentGalleryImage } from '@/lib/commentImages'
import { formatDateTime, cn } from '@/lib/utils'
import type { CommunityPostComment, UserRole } from '@/types'

function authorBadgeLabel(role?: UserRole): string | null {
  if (role === 'municipal_office') return 'MAO'
  if (role === 'farmer') return 'Community'
  return null
}

interface CommentThreadProps {
  comment: CommunityPostComment
  galleryImages: CommentGalleryImage[]
  onReply: (parentId: number) => void
  onImageClick: (commentId: number) => void
  depth?: number
}

export function CommentThread({
  comment,
  galleryImages,
  onReply,
  onImageClick,
  depth = 0,
}: CommentThreadProps) {
  const badge = authorBadgeLabel(comment.user?.role)
  const hasBody = Boolean(comment.body?.trim())
  const hasImage = Boolean(comment.image_url)

  return (
    <div className={cn('space-y-3', depth > 0 && 'ml-6 border-l-2 border-forest/10 pl-4')}>
      <div className="rounded-xl border border-black/[0.04] bg-forest/[0.03] p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-ink">{comment.user?.full_name ?? 'Farmer'}</p>
            {badge && (
              <Badge variant={badge === 'MAO' ? 'validated' : 'neutral'} className="px-2 py-0 text-[10px]">
                {badge}
              </Badge>
            )}
          </div>
          <p className="shrink-0 text-[11px] text-muted-foreground">{formatDateTime(comment.created_at)}</p>
        </div>

        {hasBody && (
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink/80">{comment.body}</p>
        )}

        {hasImage && (
          <button
            type="button"
            onClick={() => onImageClick(comment.id)}
            className="mt-3 block overflow-hidden rounded-xl border border-black/5 transition hover:border-forest/20"
          >
            <img
              src={comment.image_url!}
              alt={comment.user?.full_name ? `Photo by ${comment.user.full_name}` : 'Comment photo'}
              className="max-h-72 w-full object-cover"
              loading="lazy"
            />
          </button>
        )}

        <button
          type="button"
          onClick={() => onReply(comment.id)}
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-forest hover:underline"
        >
          <Reply className="h-3 w-3" /> Reply
        </button>
      </div>

      {commentRepliesList(comment).map((reply) => (
        <CommentThread
          key={reply.id}
          comment={reply}
          galleryImages={galleryImages}
          onReply={onReply}
          onImageClick={onImageClick}
          depth={depth + 1}
        />
      ))}
    </div>
  )
}
