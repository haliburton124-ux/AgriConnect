import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import type { Barangay, Municipality } from '@/types'

function parseMunicipalityId(municipalityId?: number | string | null) {
  if (municipalityId == null || municipalityId === '') {
    return { normalizedId: '', numericId: 0, hasMunicipality: false }
  }

  const normalizedId = String(municipalityId)
  const numericId = Number(normalizedId)

  return {
    normalizedId,
    numericId,
    hasMunicipality: Number.isFinite(numericId) && numericId > 0,
  }
}

export function useMunicipalityBarangays(municipalityId?: number | string | null) {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([])
  const [barangays, setBarangays] = useState<Barangay[]>([])
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false)
  const [loadingBarangays, setLoadingBarangays] = useState(false)
  const [barangayError, setBarangayError] = useState<string | null>(null)

  const { numericId, hasMunicipality } = useMemo(
    () => parseMunicipalityId(municipalityId),
    [municipalityId],
  )

  useEffect(() => {
    let cancelled = false

    setLoadingMunicipalities(true)
    api.get<{ data: Municipality[] }>('/locations/municipalities')
      .then((res) => {
        if (!cancelled) setMunicipalities(res.data.data)
      })
      .catch(() => {
        if (!cancelled) setMunicipalities([])
      })
      .finally(() => {
        if (!cancelled) setLoadingMunicipalities(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!hasMunicipality) {
      setBarangays([])
      setBarangayError(null)
      setLoadingBarangays(false)
      return
    }

    let cancelled = false

    setLoadingBarangays(true)
    setBarangayError(null)
    setBarangays([])

    api.get<{ data: Barangay[] }>('/locations/barangays', {
      params: { municipality_id: numericId },
    })
      .then((res) => {
        if (!cancelled) setBarangays(res.data.data ?? [])
      })
      .catch(() => {
        if (!cancelled) {
          setBarangays([])
          setBarangayError('Could not load barangays. Check your connection and try again.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingBarangays(false)
      })

    return () => {
      cancelled = true
    }
  }, [hasMunicipality, numericId])

  return {
    municipalities,
    barangays,
    loadingMunicipalities,
    loadingBarangays,
    barangayError,
    hasMunicipality,
  }
}
