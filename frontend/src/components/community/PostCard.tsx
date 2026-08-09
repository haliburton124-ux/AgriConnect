import { Heart, MessageCircle, Share2, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ExpandableText } from '@/components/ui/ExpandableText'
import { PostPhotoGrid } from '@/components/community/PostPhotoGrid'
import { SharedPostPreview } from '@/components/community/SharedPostPreview'
import { formatCategory } from '@/lib/community'
import { getCommunityPostImages } from '@/lib/communityPostImages'
import { formatDate, cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import type { CommunityPost } from '@/types'

interface PostCardProps {
  post: CommunityPost
  onOpen: (post: CommunityPost) => void
  onLike?: (post: CommunityPost) => void
  onShare?: (post: CommunityPost) => void
  compact?: boolean
}

function EngagementBar({
  post,
  onOpen,
  onLike,
  onShare,
}: {
  post: CommunityPost
  onOpen: (post: CommunityPost) => void
  onLike?: (post: CommunityPost) => void
  onShare?: (post: CommunityPost) => void
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-black/5 pt-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {post.likes_count}</span>
        <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {post.comments_count}</span>
        <span className="flex items-center gap-1"><Share2 className="h-3.5 w-3.5" /> {post.shares_count}</span>
      </div>

      <div className="flex flex-wrap gap-1">
        {onLike && (
          <Button
            size="sm"
            variant={post.liked_by_me ? 'primary' : 'ghost'}
            onClick={() => onLike(post)}
          >
            <Heart className={cn('h-3.5 w-3.5', post.liked_by_me && 'fill-current')} />
            Like
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => onOpen(post)}>
          <MessageCircle className="h-3.5 w-3.5" /> Comment
        </Button>
        {onShare && (
          <Button
            size="sm"
            variant={post.shared_by_me ? 'outline' : 'ghost'}
            onClick={() => onShare(post)}
          >
            <Share2 className="h-3.5 w-3.5" /> {post.shared_by_me ? 'Shared' : 'Share'}
          </Button>
        )}
      </div>
    </div>
  )
}

export function PostCard({ post, onOpen, onLike, onShare, compact = false }: PostCardProps) {
  const user = useAuthStore((s) => s.user)
  const images = getCommunityPostImages(post)
  const isSharedLayout = Boolean(post.is_shared_in_feed && post.shared_at)
  const sharerLabel = post.shared_by?.id === user?.id
    ? 'You'
    : post.shared_by?.full_name ?? 'Someone'

  if (isSharedLayout) {
    return (
      <Card className="transition-shadow hover:shadow-glass">
        <CardContent className={cn('space-y-3', compact ? 'p-4' : 'p-5')}>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Share2 className="h-4 w-4 shrink-0 text-forest" />
            <span className="font-medium text-ink">{sharerLabel} shared</span>
            <span>·</span>
            <span>{formatDate(post.shared_at!)}</span>
          </div>

          {post.share_caption?.trim() && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{post.share_caption}</p>
          )}

          <SharedPostPreview post={post} onOpen={() => onOpen(post)} compact={compact} />

          <EngagementBar post={post} onOpen={onOpen} onLike={onLike} onShare={onShare} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-shadow hover:shadow-glass">
      <CardContent className={cn('space-y-3', compact ? 'p-4' : 'p-5')}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="validated">{formatCategory(post.category)}</Badge>
        </div>

        <div className="w-full text-left">
          <button type="button" onClick={() => onOpen(post)} className="w-full text-left">
            <h3 className="font-semibold text-ink hover:text-forest">{post.title}</h3>
          </button>
          {images.length > 0 && (
            <div className="mt-3">
              <PostPhotoGrid
                paths={images}
                variant="compact"
                onClick={() => onOpen(post)}
              />
            </div>
          )}
          <ExpandableText text={post.content} className="mt-2 text-ink/70" />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-forest" />
          <span>Posted by {post.municipality?.name ?? 'Municipal Agriculture Office'}</span>
          <span>·</span>
          <span>{formatDate(post.created_at)}</span>
        </div>

        <EngagementBar post={post} onOpen={onOpen} onLike={onLike} onShare={onShare} />
      </CardContent>
    </Card>
  )
}
