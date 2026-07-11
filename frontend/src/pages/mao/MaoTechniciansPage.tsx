import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { HardHat, Phone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { incidentService } from '@/services/incidentService'

interface Technician {
  id: number
  full_name: string
  phone: string
}

/**
 * Read-only directory of active technicians in the officer's municipality,
 * reusing the same endpoint that powers the Assign Technician modal.
 */
export function MaoTechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[] | null>(null)

  useEffect(() => {
    incidentService.listTechnicians().then((res) => setTechnicians(res.data.data))
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Agricultural Technicians</h1>
        <p className="mt-1 text-sm text-muted-foreground">Active technicians available for assignment in your municipality.</p>
      </div>

      {technicians === null ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-28 w-full rounded-2xl" />)}
        </div>
      ) : technicians.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState icon={HardHat} title="No technicians yet" description="Ask your Admin to provision technician accounts for your municipality." />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {technicians.map((tech, i) => (
            <motion.div key={tech.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <CardContent className="flex items-center gap-3 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-white">
                    {tech.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-ink">{tech.full_name}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" /> {tech.phone}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
