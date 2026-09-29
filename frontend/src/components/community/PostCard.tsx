import { Heart, MessageCircle, Share2, MapPin } from 'lucide-react'
import { formatCategory } from '@/lib/community'
import { formatDate, storageUrl, cn } from '@/lib/utils'
import { KNOWLEDGE_IMAGES } from '@/lib/knowledgeCenterConfig'
import type { CommunityPost } from '@/types'

interface PostCardProps {
  post: CommunityPost
  onOpen: (post: CommunityPost) => void
  onLike?: (post: CommunityPost) => void
  onShare?: (post: CommunityPost) => void
  compact?: boolean
}

function coverFor(post: CommunityPost): string {
  if (post.image_path) return storageUrl(post.image_path)
  const haystack = `${post.category} ${post.title} ${post.content}`.toLowerCase()
  if (haystack.includes('pest') || haystack.includes('armyworm') || haystack.includes('disease')) return KNOWLEDGE_IMAGES.irrigation
  if (haystack.includes('weather') || haystack.includes('flood') || haystack.includes('rain')) return KNOWLEDGE_IMAGES.rice
  if (haystack.includes('vegetable')) return KNOWLEDGE_IMAGES.vegetables
  if (haystack.includes('irrigat') || haystack.includes('heat')) return KNOWLEDGE_IMAGES.irrigation
  if (haystack.includes('rice') || haystack.includes('fertiliz')) return KNOWLEDGE_IMAGES.rice
  return KNOWLEDGE_IMAGES.farming
}

export function PostCard({ post, onOpen, onLike, onShare, compact = false }: PostCardProps) {
  return (
    <article className={cn(
      'rounded-[22px] border border-black/[0.04] bg-white shadow-soft',
      compact ? 'p-5 pr-12' : 'p-6',
    )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-medium text-sky-700">
          {formatCategory(post.category)}
        </span>
        {post.is_shared_in_feed && (
          <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-medium text-gold">
            Shared to your feed
          </span>
        )}
      </div>

      <button type="button" onClick={() => onOpen(post)} className="mt-3 w-full text-left">
        <h3 className="text-lg font-semibold leading-snug text-ink hover:text-forest">{post.title}</h3>
      </button>

      <button type="button" onClick={() => onOpen(post)} className="mt-3 block w-full overflow-hidden rounded-2xl">
        <img
          src={coverFor(post)}
          alt=""
          className="h-48 w-full object-cover sm:h-56"
        />
      </button>

      <p className="mt-3 text-sm leading-relaxed text-ink/75">{post.content}</p>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 text-forest" />
        <span>Posted by {post.municipality?.name ?? 'Municipal Agriculture Office'}</span>
        <span>·</span>
        <span>{formatDate(post.created_at)}</span>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-black/5 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {post.likes_count}</span>
          <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {post.comments_count}</span>
          <span className="flex items-center gap-1"><Share2 className="h-3.5 w-3.5" /> {post.shares_count}</span>
        </div>

        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:bg-forest/5',
              post.liked_by_me ? 'text-forest' : 'text-ink/70',
            )}
            onClick={() => onLike?.(post)}
          >
            <Heart className={cn('h-4 w-4', post.liked_by_me && 'fill-current')} />
            Like
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-ink/70 transition-colors hover:bg-forest/5"
            onClick={() => onOpen(post)}
          >
            <MessageCircle className="h-4 w-4" />
            Comment
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-ink/70 transition-colors hover:bg-forest/5"
            onClick={() => onShare?.(post)}
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>
    </article>
  )
}
