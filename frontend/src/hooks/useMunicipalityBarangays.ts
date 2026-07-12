import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Barangay, Municipality } from '@/types'

export function useMunicipalityBarangays(municipalityId?: number | string | null) {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([])
  const [barangays, setBarangays] = useState<Barangay[]>([])
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false)
  const [loadingBarangays, setLoadingBarangays] = useState(false)

  const numericMunicipalityId = Number(municipalityId) || 0
  const hasMunicipality = numericMunicipalityId > 0

  useEffect(() => {
    setLoadingMunicipalities(true)
    api.get<{ data: Municipality[] }>('/locations/municipalities')
      .then((res) => setMunicipalities(res.data.data))
      .catch(() => setMunicipalities([]))
      .finally(() => setLoadingMunicipalities(false))
  }, [])

  useEffect(() => {
    if (!hasMunicipality) {
      setBarangays([])
      return
    }

    setLoadingBarangays(true)
    api.get<{ data: Barangay[] }>('/locations/barangays', { params: { municipality_id: numericMunicipalityId } })
      .then((res) => setBarangays(res.data.data))
      .catch(() => setBarangays([]))
      .finally(() => setLoadingBarangays(false))
  }, [hasMunicipality, numericMunicipalityId])

  return {
    municipalities,
    barangays,
    loadingMunicipalities,
    loadingBarangays,
    hasMunicipality,
  }
}
