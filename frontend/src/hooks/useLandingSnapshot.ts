import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Advisory } from '@/services/advisoryService'
import type { Announcement, KnowledgeArticle, PaginatedResponse, Program } from '@/types'
import { formatDate, storageUrl } from '@/lib/utils'

export interface LandingUpdateCard {
  id: string
  category: string
  title: string
  description: string
  date: string
  href: string
  image?: string | null
}

export interface LandingStats {
  farmersLabel: string
  farmersValue: string
  servicesLabel: string
  servicesValue: string
  accessLabel: string
  accessValue: string
  partnersLabel: string
  partnersValue: string
}

const FALLBACK_STATS: LandingStats = {
  farmersValue: '500+',
  farmersLabel: 'Registered Farmers',
  servicesValue: '50+',
  servicesLabel: 'Agricultural Services',
  accessValue: '24/7',
  accessLabel: 'Digital Access',
  partnersValue: '10+',
  partnersLabel: 'Agricultural Partners',
}

const FALLBACK_UPDATES: LandingUpdateCard[] = [
  {
    id: 'fb-1',
    category: 'Announcement',
    title: 'Rice Support Program Now Open',
    description: 'The Department of Agriculture announces the new rice support program for smallholder farmers.',
    date: 'May 15, 2026',
    href: '/government-programs',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'fb-2',
    category: 'Farming Tip',
    title: 'Natural Ways to Control Pest in Your Crops',
    description: 'Practical and effective natural methods to keep your crops healthy without overusing chemicals.',
    date: 'May 12, 2026',
    href: '/knowledge-center',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'fb-3',
    category: 'Advisory',
    title: 'Heavy Rainfall Advisory for Region I',
    description: 'Monitor fields closely. Heavy rainfall advisory is in effect for several areas in Ilocos Norte.',
    date: 'May 10, 2026',
    href: '/agricultural-extension',
    image: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'fb-4',
    category: 'Program',
    title: 'Farmers Training Program for Sustainable Agriculture',
    description: 'Join the upcoming training program on sustainable farming practices.',
    date: 'May 8, 2026',
    href: '/government-programs',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80',
  },
]

function excerpt(html: string, max = 110): string {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (text.length <= max) return text
  return `${text.slice(0, max).trim()}…`
}

function formatCount(value: number, fallback: string): string {
  if (!Number.isFinite(value) || value <= 0) return fallback
  if (value >= 1000) return `${Math.round(value / 1000)}k+`
  return `${value}+`
}

export function useLandingSnapshot() {
  const [stats, setStats] = useState<LandingStats>(FALLBACK_STATS)
  const [updates, setUpdates] = useState<LandingUpdateCard[]>(FALLBACK_UPDATES)

  useEffect(() => {
    const cfg = { skipLoader: true as const }

    Promise.allSettled([
      api.get<{ data: { id: number }[] }>('/locations/municipalities', cfg),
      api.get<PaginatedResponse<Program>>('/programs', { ...cfg, params: { per_page: 4 } }),
      api.get<PaginatedResponse<Announcement>>('/announcements', { ...cfg, params: { per_page: 4 } }),
      api.get<PaginatedResponse<Advisory>>('/advisories', { ...cfg, params: { per_page: 4 } }),
      api.get<PaginatedResponse<KnowledgeArticle>>('/knowledge/articles', { ...cfg, params: { per_page: 4 } }),
    ]).then(([municipalities, programs, announcements, advisories, articles]) => {
      const nextStats = { ...FALLBACK_STATS }
      const cards: LandingUpdateCard[] = []

      if (municipalities.status === 'fulfilled') {
        const count = municipalities.value.data.data?.length ?? 0
        if (count > 0) {
          nextStats.partnersValue = formatCount(count, FALLBACK_STATS.partnersValue)
          nextStats.partnersLabel = 'Municipalities Covered'
        }
      }

      if (programs.status === 'fulfilled') {
        const total = programs.value.data.meta?.total ?? programs.value.data.data.length
        if (total > 0) {
          nextStats.servicesValue = formatCount(total, FALLBACK_STATS.servicesValue)
          nextStats.servicesLabel = 'Agricultural Programs'
        }
        programs.value.data.data.slice(0, 1).forEach((item) => {
          cards.push({
            id: `program-${item.id}`,
            category: 'Program',
            title: item.title,
            description: excerpt(item.description || 'Explore agricultural programs and assistance available to farmers.'),
            date: formatDate(item.created_at),
            href: '/government-programs',
            image: item.cover_image_path ? storageUrl(item.cover_image_path) : FALLBACK_UPDATES[3].image,
          })
        })
      }

      if (announcements.status === 'fulfilled') {
        announcements.value.data.data.slice(0, 1).forEach((item) => {
          cards.push({
            id: `announcement-${item.id}`,
            category: 'Announcement',
            title: item.title,
            description: excerpt(item.content || 'Latest agricultural announcement from AgriConnect.'),
            date: item.published_at ? formatDate(item.published_at) : '',
            href: '/agricultural-extension',
            image: item.cover_image_path ? storageUrl(item.cover_image_path) : FALLBACK_UPDATES[0].image,
          })
        })
      }

      if (advisories.status === 'fulfilled') {
        advisories.value.data.data.slice(0, 1).forEach((item) => {
          cards.push({
            id: `advisory-${item.id}`,
            category: 'Advisory',
            title: item.title,
            description: excerpt(item.content || 'Stay informed with the latest farming advisory.'),
            date: formatDate(item.created_at),
            href: '/agricultural-extension',
            image: FALLBACK_UPDATES[2].image,
          })
        })
      }

      if (articles.status === 'fulfilled') {
        articles.value.data.data.slice(0, 1).forEach((item) => {
          cards.push({
            id: `article-${item.id}`,
            category: 'Farming Tip',
            title: item.title,
            description: excerpt(item.content || 'Find useful farming information and agricultural resources.'),
            date: formatDate(item.created_at),
            href: '/knowledge-center',
            image: item.cover_image_path ? storageUrl(item.cover_image_path) : FALLBACK_UPDATES[1].image,
          })
        })
      }

      setStats(nextStats)
      setUpdates(cards.length >= 4 ? cards.slice(0, 4) : [...cards, ...FALLBACK_UPDATES].slice(0, 4))
    })
  }, [])

  return { stats, updates }
}
