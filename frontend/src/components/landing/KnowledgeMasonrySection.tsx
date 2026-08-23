import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Video, HelpCircle, FileDown, ArrowRight } from 'lucide-react'
import { SectionHeading } from './SectionHeading'
import { knowledgeService } from '@/services/knowledgeService'
import { useAuthStore } from '@/store/authStore'
import type { KnowledgeArticle } from '@/types'

const TYPE_ICONS: Record<KnowledgeArticle['type'], typeof BookOpen> = {
  article: BookOpen,
  video: Video,
  faq: HelpCircle,
  pdf_guide: FileDown,
}

// Alternating heights give the grid a masonry rhythm without a JS layout library.
const HEIGHT_CLASSES = ['sm:mt-0', 'sm:mt-8', 'sm:mt-0', 'sm:mt-8']

export function KnowledgeMasonrySection() {
  const [articles, setArticles] = useState<KnowledgeArticle[] | null>(null)
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    knowledgeService.list({}).then((res) => setArticles(res.data.data.slice(0, 4)))
  }, [])

  const openCenter = () => navigate(isAuthenticated ? '/farmer/knowledge' : '/knowledge-center')

  return (
    <section id="knowledge" className="scroll-mt-24 bg-canvas px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Learn & Grow"
            title="Knowledge Center"
            align="left"
            className="mx-0 max-w-xl text-left"
          />
          <button
            onClick={openCenter}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-forest px-5 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-white"
          >
            Browse all guides <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {articles === null ? (
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-64 w-full rounded-[22px]" />)}
          </div>
        ) : articles.length === 0 ? (
          <div className="mt-12 flex flex-col items-center rounded-[22px] bg-white p-12 text-center shadow-soft">
            <BookOpen className="h-10 w-10 text-forest-light" />
            <p className="mt-3 text-sm text-ink/60">Articles and guides will appear here soon.</p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {articles.map((article, i) => {
              const Icon = TYPE_ICONS[article.type]
              return (
                <motion.button
                  key={article.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  whileHover={{ y: -6 }}
                  onClick={openCenter}
                  className={`group flex flex-col overflow-hidden rounded-[22px] bg-white p-6 text-left shadow-soft ring-1 ring-black/5 transition-shadow hover:shadow-glass ${HEIGHT_CLASSES[i % HEIGHT_CLASSES.length]}`}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest/10 text-forest transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 line-clamp-2 font-semibold text-ink">{article.title}</h3>
                  <span className="mt-auto pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {article.type.replace('_', ' ')}
                  </span>
                </motion.button>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
