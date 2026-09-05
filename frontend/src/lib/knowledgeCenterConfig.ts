import type { LucideIcon } from 'lucide-react'
import {
  Sprout, Bug, Tractor, CloudRain, Megaphone, GraduationCap,
} from 'lucide-react'

export type QuickCategoryKey =
  | 'crop_guides'
  | 'pests_diseases'
  | 'farming_practices'
  | 'weather_climate'
  | 'advisories'
  | 'learning_materials'

export interface QuickCategory {
  key: QuickCategoryKey
  title: string
  description: string
  icon: LucideIcon
}

export interface TopicItem {
  slug: string
  name: string
  keywords: string[]
}

export const QUICK_CATEGORIES: QuickCategory[] = [
  {
    key: 'crop_guides',
    title: 'Crop Guides',
    description: 'Practical guides for growing and managing different crops.',
    icon: Sprout,
  },
  {
    key: 'pests_diseases',
    title: 'Pests & Diseases',
    description: 'Identify common pests, diseases, symptoms, and management practices.',
    icon: Bug,
  },
  {
    key: 'farming_practices',
    title: 'Farming Practices',
    description: 'Learn effective and sustainable farming techniques.',
    icon: Tractor,
  },
  {
    key: 'weather_climate',
    title: 'Weather & Climate',
    description: 'Agricultural weather information and climate-related guidance.',
    icon: CloudRain,
  },
  {
    key: 'advisories',
    title: 'Advisories',
    description: 'Important agricultural alerts, announcements, and recommendations.',
    icon: Megaphone,
  },
  {
    key: 'learning_materials',
    title: 'Learning Materials',
    description: 'Educational videos, infographics, PDFs, and other resources.',
    icon: GraduationCap,
  },
]

export const BROWSE_TOPICS: TopicItem[] = [
  { slug: 'rice', name: 'Rice', keywords: ['rice', 'palay'] },
  { slug: 'pests', name: 'Pests', keywords: ['pest', 'insect', 'armyworm'] },
  { slug: 'irrigation', name: 'Irrigation', keywords: ['irrigation', 'water'] },
  { slug: 'corn', name: 'Corn', keywords: ['corn', 'maize'] },
  { slug: 'diseases', name: 'Diseases', keywords: ['disease', 'blight', 'rot'] },
  { slug: 'vegetables', name: 'Vegetables', keywords: ['vegetable', 'tomato', 'eggplant'] },
  { slug: 'soil-fertilizer', name: 'Soil & Fertilizer', keywords: ['soil', 'fertilizer', 'nutrient'] },
  { slug: 'harvesting', name: 'Harvesting', keywords: ['harvest'] },
  { slug: 'post-harvest', name: 'Post Harvest', keywords: ['post harvest', 'storage', 'handling'] },
  { slug: 'agri-business', name: 'Agri Business', keywords: ['business', 'market', 'enterprise'] },
  { slug: 'weather', name: 'Weather', keywords: ['weather', 'climate', 'rain', 'drought'] },
  { slug: 'organic-farming', name: 'Organic Farming', keywords: ['organic', 'sustainable'] },
]

/** Fallback imagery when API items have no cover image. */
export const KNOWLEDGE_IMAGES = {
  rice: 'https://images.unsplash.com/photo-1530053969600-caed259a2429?w=800&q=80',
  irrigation: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80',
  weather: 'https://images.unsplash.com/photo-1527482790661-1800d2794c7e?w=800&q=80',
  pest: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
  vegetables: 'https://images.unsplash.com/photo-1464226184884-fa280b87c0d3?w=800&q=80',
  farming: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
  hero: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=80',
  farmer: 'https://images.unsplash.com/photo-1628352081507-83c9582a257b?w=800&q=80',
} as const

export function formatMunicipalityLocation(municipalityName?: string | null): string {
  if (municipalityName) return `${municipalityName}, Ilocos Norte`
  return 'Ilocos Norte'
}
