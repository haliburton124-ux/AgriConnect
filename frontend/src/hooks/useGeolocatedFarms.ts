import { useCallback, useEffect, useState } from 'react'
import { farmService } from '@/services/farmService'
import { getGeolocatedFarms } from '@/lib/farms'
import type { Farm } from '@/types'

export function useGeolocatedFarms(enabled = true) {
  const [farms, setFarms] = useState<Farm[] | null>(null)
  const [loading, setLoading] = useState(false)

  const reload = useCallback(async () => {
    if (!enabled) {
      setFarms([])
      return []
    }

    setLoading(true)
    try {
      const { data } = await farmService.list()
      const geolocated = getGeolocatedFarms(data.data)
      setFarms(geolocated)
      return geolocated
    } catch {
      setFarms([])
      return []
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    void reload()
  }, [reload])

  return {
    farms,
    loading,
    hasFarm: (farms?.length ?? 0) > 0,
    reload,
  }
}
