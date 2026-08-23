import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Gift, Calendar, ClipboardList } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ApplyProgramModal } from '@/components/modals/ApplyProgramModal'
import { programService } from '@/services/programService'
import { useAuthStore } from '@/store/authStore'
import { formatDate } from '@/lib/utils'
import type { Program, ProgramApplication } from '@/types'

const CATEGORY_COLORS: Record<Program['category'], string> = {
  subsidy: '#2E7D32',
  training: '#0288D1',
  loan: '#F9A825',
  seedling: '#66BB6A',
  equipment: '#6D4C41',
  insurance: '#8E24AA',
  other: '#616161',
}

export function ProgramsPage() {
  const { user } = useAuthStore()
  const isFarmer = user?.role === 'farmer'
  const [programs, setPrograms] = useState<Program[] | null>(null)
  const [applications, setApplications] = useState<ProgramApplication[]>([])
  const [selected, setSelected] = useState<Program | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const load = () => {
    programService.list().then((res) => setPrograms(res.data.data))
    if (isFarmer) {
      programService.myApplications().then((res) => setApplications(res.data.data))
    }
  }

  useEffect(load, []) // eslint-disable-line react-hooks/exhaustive-deps

  const appliedProgramIds = new Set(applications.map((a) => a.program?.id))

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Government Programs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isFarmer ? 'Browse subsidies, training, loans, and other assistance programs.' : 'Programs currently published to farmers.'}
        </p>
      </div>

      {isFarmer && applications.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink">
              <ClipboardList className="h-4 w-4" /> My Applications
            </h3>
            <div className="space-y-2">
              {applications.map((app) => (
                <div key={app.id} className="flex items-center justify-between rounded-lg bg-forest/[0.03] px-3 py-2">
                  <span className="text-sm text-ink/80">{app.program?.title}</span>
                  <Badge variant={app.status === 'approved' ? 'resolved' : app.status === 'rejected' ? 'rejected' : 'pending'}>
                    {app.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {programs === null ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-48 w-full rounded-2xl" />)}
        </div>
      ) : programs.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState icon={Gift} title="No programs available" description="Check back later for new government assistance programs." />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program, i) => {
            const alreadyApplied = appliedProgramIds.has(program.id)
            const closed = program.application_end && new Date(program.application_end) < new Date()

            return (
              <motion.div key={program.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="flex h-full flex-col">
                  <CardContent className="flex h-full flex-col gap-3 p-5">
                    <span
                      className="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize"
                      style={{ backgroundColor: `${CATEGORY_COLORS[program.category]}15`, color: CATEGORY_COLORS[program.category] }}
                    >
                      {program.category}
                    </span>
                    <h3 className="font-semibold text-ink">{program.title}</h3>
                    <p className="line-clamp-3 text-sm text-ink/70">{program.description}</p>

                    {program.application_end && (
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" /> Apply by {formatDate(program.application_end)}
                      </p>
                    )}

                    {isFarmer && (
                      <Button
                        className="mt-auto"
                        disabled={alreadyApplied || Boolean(closed)}
                        onClick={() => { setSelected(program); setModalOpen(true) }}
                      >
                        {alreadyApplied ? 'Already Applied' : closed ? 'Applications Closed' : 'Apply Now'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {isFarmer && (
        <ApplyProgramModal open={modalOpen} onClose={() => setModalOpen(false)} program={selected} onSuccess={load} />
      )}
    </div>
  )
}

