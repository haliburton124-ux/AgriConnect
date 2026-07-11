import { motion } from 'framer-motion'
import { Construction } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

interface ComingSoonPageProps {
  title: string
}

/**
 * Placeholder for nav destinations whose backend endpoints already exist
 * (see docs/) but whose screen hasn't been built yet. Keeps the shell fully
 * navigable while the remaining screens are built module by module.
 */
export function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[60vh] items-center justify-center"
    >
      <Card className="max-w-md text-center">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-card">
            <Construction className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink">{title}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              This screen is being built next. The API for this feature is already live.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
