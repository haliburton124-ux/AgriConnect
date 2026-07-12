import type { CommunityPostCategory } from '@/types'
import { getAdvisoryCategoryLabel } from '@/lib/advisoryCategories'

export const CATEGORY_LABELS: Record<CommunityPostCategory, string> = {
  pesticide_usage: 'Pesticide Usage',
  crop_disease: 'Crop Disease',
  soil_management: 'Soil Management',
  suitable_crops: 'Suitable Crops',
  weather_advisory: 'Weather Advisory',
  planting_calendar: 'Planting Calendar',
  pest_outbreak: 'Pest Outbreak',
  irrigation: 'Irrigation',
  fertilizer: 'Fertilizer',
  best_practices: 'Best Practices',
  general: 'General',
}

export function formatCategory(category: string): string {
  return CATEGORY_LABELS[category as CommunityPostCategory] ?? getAdvisoryCategoryLabel(category)
}
