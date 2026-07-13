import { Heart, MessageCircle, Share2, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ExpandableText } from '@/components/ui/ExpandableText'
import { formatCategory } from '@/lib/community'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { CommunityPost } from '@/types'

interface PostCardProps {
  post: CommunityPost
  onOpen: (post: CommunityPost) => void
  onLike?: (post: CommunityPost) => void
  onShare?: (post: CommunityPost) => void
  compact?: boolean
}

export function PostCard({ post, onOpen, onLike, onShare, compact = false }: PostCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-glass">
      <CardContent className={cn('space-y-3', compact ? 'p-4' : 'p-5')}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="validated">{formatCategory(post.category)}</Badge>
          {post.is_shared_in_feed && (
            <Badge variant="medium">Shared to your feed</Badge>
          )}
        </div>

        <div className="w-full text-left">
          <button type="button" onClick={() => onOpen(post)} className="w-full text-left">
            <h3 className="font-semibold text-ink hover:text-forest">{post.title}</h3>
          </button>
          <ExpandableText text={post.content} className="mt-2 text-ink/70" />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-forest" />
          <span>Posted by {post.municipality?.name ?? 'Municipal Agriculture Office'}</span>
          <span>·</span>
          <span>{formatDate(post.created_at)}</span>
        </div>

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
              <Button size="sm" variant="ghost" onClick={() => onShare(post)}>
                <Share2 className="h-3.5 w-3.5" /> Share
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
