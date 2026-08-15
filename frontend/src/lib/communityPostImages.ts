import type { CommunityPost } from '@/types'
import { storageUrl } from '@/lib/utils'

/** Resolve display URLs for all images on a community post. */
export function getCommunityPostImages(post: CommunityPost): string[] {
  return post.image_path ? [storageUrl(post.image_path)] : []
}
