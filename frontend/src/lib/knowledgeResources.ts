import { formatDate, storageUrl } from '@/lib/utils'
import { KNOWLEDGE_IMAGES } from '@/lib/knowledgeCenterConfig'
import type { CommunityPost, KnowledgeArticle } from '@/types'

export type KnowledgeResourceType = 'article' | 'video' | 'pdf_guide' | 'faq' | 'advisory' | 'infographic'

export interface KnowledgeResource {
  id: string
  title: string
  description: string
  categoryLabel: string
  type: KnowledgeResourceType
  imageUrl: string
  date: string
  viewCount?: number
  duration?: string
  fileSize?: string
  articleId?: number
  postId?: number
}

function excerpt(text: string, max = 120): string {
  const trimmed = text.replace(/\s+/g, ' ').trim()
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max - 1)}…`
}

function imageForArticle(article: KnowledgeArticle): string {
  if (article.cover_image_path) return storageUrl(article.cover_image_path)
  const title = article.title.toLowerCase()
  if (title.includes('rice')) return KNOWLEDGE_IMAGES.rice
  if (title.includes('irrigation') || title.includes('water')) return KNOWLEDGE_IMAGES.irrigation
  if (title.includes('weather') || title.includes('rain')) return KNOWLEDGE_IMAGES.weather
  if (title.includes('pest') || title.includes('armyworm')) return KNOWLEDGE_IMAGES.pest
  if (title.includes('vegetable')) return KNOWLEDGE_IMAGES.vegetables
  return KNOWLEDGE_IMAGES.farming
}

function imageForPost(post: CommunityPost): string {
  if (post.image_path) return storageUrl(post.image_path)
  if (post.category.includes('weather')) return KNOWLEDGE_IMAGES.weather
  if (post.category.includes('pest')) return KNOWLEDGE_IMAGES.pest
  return KNOWLEDGE_IMAGES.farming
}

function categoryLabelFromPost(category: string): string {
  return category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function articleToResource(article: KnowledgeArticle): KnowledgeResource {
  const type = article.type === 'pdf_guide' ? 'pdf_guide' : article.type
  return {
    id: `article-${article.id}`,
    title: article.title,
    description: excerpt(article.content),
    categoryLabel: article.category?.name ?? 'Guide',
    type,
    imageUrl: imageForArticle(article),
    date: formatDate(article.created_at),
    viewCount: article.view_count,
    fileSize: article.type === 'pdf_guide' ? 'PDF Guide' : undefined,
    duration: article.type === 'video' ? 'Video' : undefined,
    articleId: article.id,
  }
}

export function postToResource(post: CommunityPost): KnowledgeResource {
  return {
    id: `post-${post.id}`,
    title: post.title,
    description: excerpt(post.content),
    categoryLabel: categoryLabelFromPost(post.category),
    type: 'advisory',
    imageUrl: imageForPost(post),
    date: formatDate(post.created_at),
    postId: post.id,
  }
}

export const FALLBACK_FEATURED: KnowledgeResource[] = [
  {
    id: 'static-rice-guide',
    title: 'Rice Production Guide',
    description: 'Step-by-step guidance on land preparation, planting, and harvest management for rice farmers.',
    categoryLabel: 'Crop Guide',
    type: 'article',
    imageUrl: KNOWLEDGE_IMAGES.rice,
    date: 'May 10, 2024',
  },
  {
    id: 'static-irrigation',
    title: 'Efficient Irrigation Practices',
    description: 'Learn how to conserve water while maintaining healthy crop growth during dry and wet seasons.',
    categoryLabel: 'Farming Tip',
    type: 'article',
    imageUrl: KNOWLEDGE_IMAGES.irrigation,
    date: 'May 8, 2024',
  },
  {
    id: 'static-rain-advisory',
    title: 'Heavy Rainfall Advisory',
    description: 'Prepare your fields and crops for incoming heavy rainfall with these recommended precautions.',
    categoryLabel: 'Advisory',
    type: 'advisory',
    imageUrl: KNOWLEDGE_IMAGES.weather,
    date: 'May 5, 2024',
  },
  {
    id: 'static-armyworm',
    title: 'Fall Armyworm Alert in Corn',
    description: 'Early detection and control measures to protect corn fields from fall armyworm infestation.',
    categoryLabel: 'Pest Alert',
    type: 'advisory',
    imageUrl: KNOWLEDGE_IMAGES.pest,
    date: 'May 3, 2024',
  },
]

export const FALLBACK_LEARNING: KnowledgeResource[] = [
  {
    id: 'static-fertilizer-video',
    title: 'Proper Fertilizer Application for Rice',
    description: 'Watch how to apply fertilizer at the right time and rate for better yield.',
    categoryLabel: 'Video',
    type: 'video',
    imageUrl: KNOWLEDGE_IMAGES.rice,
    date: 'Apr 28, 2024',
    duration: '5:24 min',
  },
  {
    id: 'static-pest-infographic',
    title: 'Pest Management Guide',
    description: 'Visual guide to identifying and managing common rice and corn pests.',
    categoryLabel: 'Infographic',
    type: 'infographic',
    imageUrl: KNOWLEDGE_IMAGES.pest,
    date: 'Apr 20, 2024',
  },
  {
    id: 'static-vegetable-pdf',
    title: 'Vegetable Farming Guidebook',
    description: 'Downloadable reference for planting, caring, and harvesting common vegetables.',
    categoryLabel: 'PDF Guide',
    type: 'pdf_guide',
    imageUrl: KNOWLEDGE_IMAGES.vegetables,
    date: 'Apr 15, 2024',
    fileSize: 'PDF · 2.4 MB',
  },
  {
    id: 'static-post-harvest',
    title: 'Post Harvest Handling Best Practices',
    description: 'Reduce losses after harvest with proper drying, storage, and handling techniques.',
    categoryLabel: 'Guide',
    type: 'pdf_guide',
    imageUrl: KNOWLEDGE_IMAGES.farming,
    date: 'Apr 10, 2024',
    fileSize: 'PDF · 1.8 MB',
  },
]

export function matchesQuickCategory(resource: KnowledgeResource, key: string): boolean {
  const haystack = `${resource.title} ${resource.description} ${resource.categoryLabel}`.toLowerCase()
  switch (key) {
    case 'crop_guides':
      return haystack.includes('crop') || haystack.includes('rice') || haystack.includes('corn') || haystack.includes('vegetable')
    case 'pests_diseases':
      return haystack.includes('pest') || haystack.includes('disease') || haystack.includes('armyworm')
    case 'farming_practices':
      return haystack.includes('farm') || haystack.includes('irrigation') || haystack.includes('practice') || haystack.includes('harvest')
    case 'weather_climate':
      return haystack.includes('weather') || haystack.includes('rain') || haystack.includes('climate')
    case 'advisories':
      return resource.type === 'advisory' || haystack.includes('advisory') || haystack.includes('alert')
    case 'learning_materials':
      return resource.type === 'video' || resource.type === 'pdf_guide' || resource.type === 'infographic' || resource.type === 'faq'
    default:
      return true
  }
}

export function matchesTopic(resource: KnowledgeResource, keywords: string[]): boolean {
  const haystack = `${resource.title} ${resource.description} ${resource.categoryLabel}`.toLowerCase()
  return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()))
}

export function matchesSearch(resource: KnowledgeResource, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return `${resource.title} ${resource.description} ${resource.categoryLabel}`.toLowerCase().includes(q)
}
