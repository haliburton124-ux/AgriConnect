import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileBarChart, Download, FileText, FileSpreadsheet, FileType2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ExportReportModal } from '@/components/modals/ExportReportModal'
import { useAuthStore } from '@/store/authStore'

const FORMAT_CARDS = [
  { icon: FileType2, label: 'PDF', description: 'A branded, print-ready summary with status badges — ideal for sharing with officials.' },
  { icon: FileSpreadsheet, label: 'Excel', description: 'Fully formatted spreadsheet for further analysis, pivoting, or charting.' },
  { icon: FileText, label: 'CSV', description: 'Raw tabular data that opens in any spreadsheet or analysis tool.' },
]

export function ReportsPage() {
  const { user } = useAuthStore()
  const [exportOpen, setExportOpen] = useState(false)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {user?.role === 'municipal_office'
              ? 'Export incident reports for your municipality.'
              : 'Export incident reports province-wide or for a specific municipality.'}
          </p>
        </div>
        <Button onClick={() => setExportOpen(true)}>
          <Download className="h-4 w-4" /> Export Report
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-gradient-hero px-6 py-10 text-center text-white sm:px-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <FileBarChart className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">Incident Reports, On Demand</h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-white/80">
            Filter by date range{user?.role !== 'municipal_office' ? ' and municipality' : ''}, then export in the
            format that works best for you.
          </p>
        </div>
        <CardContent className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
          {FORMAT_CARDS.map((format, i) => (
            <motion.div
              key={format.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-black/5 p-4"
            >
              <format.icon className="h-5 w-5 text-forest" />
              <p className="mt-2 text-sm font-semibold text-ink">{format.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{format.description}</p>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <ExportReportModal open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  )
}
