import { MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { ExpandableText } from '@/components/ui/ExpandableText'
import { PostPhotoGrid } from '@/components/community/PostPhotoGrid'
import { formatCategory } from '@/lib/community'
import { getCommunityPostImages } from '@/lib/communityPostImages'
import { formatDate, cn } from '@/lib/utils'
import type { CommunityPost } from '@/types'

interface SharedPostPreviewProps {
  post: CommunityPost
  onOpen?: () => void
  compact?: boolean
  className?: string
}

/** Read-only nested preview of the original post inside a shared-post card. */
export function SharedPostPreview({ post, onOpen, compact = false, className }: SharedPostPreviewProps) {
  const images = getCommunityPostImages(post)
  const Wrapper = onOpen ? 'button' : 'div'

  return (
    <Wrapper
      type={onOpen ? 'button' : undefined}
      onClick={onOpen}
      className={cn(
        'block w-full rounded-xl border border-black/10 bg-forest/[0.02] text-left transition-colors',
        onOpen && 'hover:border-forest/20 hover:bg-forest/[0.04]',
        compact ? 'p-3' : 'p-4',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="validated">{formatCategory(post.category)}</Badge>
      </div>

      <h4 className={cn('mt-2 font-semibold text-ink', compact ? 'text-sm' : 'text-base')}>
        {post.title}
      </h4>

      {images.length > 0 && (
        <div className="mt-2">
          <PostPhotoGrid paths={images} variant="compact" />
        </div>
      )}

      <ExpandableText
        text={post.content}
        className={cn('mt-2 text-ink/70', compact ? 'text-xs' : 'text-sm')}
        maxLines={compact ? 3 : 4}
      />

      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-forest" />
        <span>
          {post.author?.full_name ?? post.municipality?.name ?? 'Municipal Agriculture Office'}
        </span>
        {post.municipality && post.author && (
          <>
            <span>·</span>
            <span>{post.municipality.name}</span>
          </>
        )}
        <span>·</span>
        <span>{formatDate(post.created_at)}</span>
      </div>
    </Wrapper>
  )
}
