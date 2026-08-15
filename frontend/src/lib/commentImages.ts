import type { CommunityPostComment } from '@/types'
import { storageUrl } from '@/lib/utils'

export interface CommentGalleryImage {
  id: number
  url: string
  alt: string
}

/** Resolve a display URL for a comment photo (API url, stored path, or null). */
export function getCommentImageUrl(comment: CommunityPostComment): string | null {
  if (comment.image_url) return comment.image_url
  if (comment.image_path) return storageUrl(comment.image_path)
  return null
}

export function commentHasImage(comment: CommunityPostComment): boolean {
  return Boolean(getCommentImageUrl(comment))
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
      const url = getCommentImageUrl(comment)
      if (url) {
        images.push({
          id: comment.id,
          url,
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
export const COMMENT_IMAGE_MAX_BYTES = 10 * 1024 * 1024

export function validateCommentImage(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Please choose a JPEG, PNG, WebP, or GIF image.'
  }

  if (file.size > COMMENT_IMAGE_MAX_BYTES) {
    return 'Image must be 10 MB or smaller.'
  }

  return null
}
