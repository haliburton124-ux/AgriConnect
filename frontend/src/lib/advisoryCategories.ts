import type { LucideIcon } from 'lucide-react'
import {
  LayoutGrid, FlaskConical, Microscope, Sprout, Leaf, CloudSun,
  Calendar, Bug, Droplets, Package, Award, Info,
} from 'lucide-react'
import type { CommunityPostCategory } from '@/types'

export interface AdvisoryCategoryItem {
  value: CommunityPostCategory | null
  label: string
  icon: LucideIcon
}

export const ADVISORY_CATEGORIES: AdvisoryCategoryItem[] = [
  { value: null, label: 'All Topics', icon: LayoutGrid },
  { value: 'pesticide_usage', label: 'Pesticide Usage', icon: FlaskConical },
  { value: 'crop_disease', label: 'Crop Disease', icon: Microscope },
  { value: 'soil_management', label: 'Soil Management', icon: Sprout },
  { value: 'suitable_crops', label: 'Suitable Crops', icon: Leaf },
  { value: 'weather_advisory', label: 'Weather Advisory', icon: CloudSun },
  { value: 'planting_calendar', label: 'Planting Calendar', icon: Calendar },
  { value: 'pest_outbreak', label: 'Pest Outbreak', icon: Bug },
  { value: 'irrigation', label: 'Irrigation', icon: Droplets },
  { value: 'fertilizer', label: 'Fertilizer', icon: Package },
  { value: 'best_practices', label: 'Best Practices', icon: Award },
  { value: 'general', label: 'General', icon: Info },
]

export function getAdvisoryCategoryLabel(value: string | null): string {
  if (!value) return 'All Topics'
  return ADVISORY_CATEGORIES.find((c) => c.value === value)?.label ?? value.replace(/_/g, ' ')
}

export function findAdvisoryCategoryByLabel(label: string) {
  const normalized = label.trim().toLowerCase()
  return ADVISORY_CATEGORIES.find((c) => c.label.toLowerCase() === normalized)
}
