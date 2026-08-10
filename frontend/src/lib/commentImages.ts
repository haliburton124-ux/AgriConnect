import type { CommunityPostComment } from '@/types'

export interface CommentGalleryImage {
  id: number
  url: string
  alt: string
}

function commentReplies(comment: CommunityPostComment): CommunityPostComment[] {
  const replies = comment.replies
  if (!replies) return []
  if (Array.isArray(replies)) return replies
  const wrapped = replies as { data?: CommunityPostComment[] }
  return Array.isArray(wrapped.data) ? wrapped.data : []
}

export function collectCommentImages(comments: CommunityPostComment[]): CommentGalleryImage[] {
  const images: CommentGalleryImage[] = []

  const walk = (items: CommunityPostComment[]) => {
    for (const comment of items) {
      if (comment.image_url) {
        images.push({
          id: comment.id,
          url: comment.image_url,
          alt: comment.user?.full_name ? `Photo by ${comment.user.full_name}` : 'Comment photo',
        })
      }
      walk(commentReplies(comment))
    }
  }

  walk(comments)
  return images
}

export function countThreadedComments(items: CommunityPostComment[]): number {
  return items.reduce((total, comment) => total + 1 + countThreadedComments(commentReplies(comment)), 0)
}

export function commentRepliesList(comment: CommunityPostComment): CommunityPostComment[] {
  return commentReplies(comment)
}

export const COMMENT_IMAGE_ACCEPT = 'image/jpeg,image/jpg,image/png,image/webp,image/gif'
export const COMMENT_IMAGE_MAX_BYTES = 5 * 1024 * 1024

export function validateCommentImage(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Please choose a JPEG, PNG, WebP, or GIF image.'
  }

  if (file.size > COMMENT_IMAGE_MAX_BYTES) {
    return 'Image must be 5 MB or smaller.'
  }

  return null
}
