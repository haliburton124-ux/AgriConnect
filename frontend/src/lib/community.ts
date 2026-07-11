import type { CommunityPostCategory } from '@/types'

export const CATEGORY_LABELS: Record<CommunityPostCategory, string> = {
  pesticide_usage: 'Pesticide Usage',
  crop_disease: 'Crop Disease Treatment',
  soil_management: 'Soil Management',
  suitable_crops: 'Suitable Crops',
  weather_advisory: 'Weather Advisory',
  planting_calendar: 'Planting Calendar',
  pest_outbreak: 'Pest Outbreak Alert',
  irrigation: 'Irrigation Techniques',
  fertilizer: 'Fertilizer Recommendations',
  best_practices: 'Farming Best Practices',
  general: 'General',
}

export function formatCategory(category: string): string {
  return CATEGORY_LABELS[category as CommunityPostCategory] ?? category.replace(/_/g, ' ')
}
