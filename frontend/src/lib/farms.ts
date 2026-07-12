import type { Farm } from '@/types'

export function isValidFarmLocation(farm: Farm): boolean {
  const { latitude, longitude } = farm
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false
  if (latitude === 0 && longitude === 0) return false
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return false
  return Boolean(farm.municipality?.id && farm.barangay?.id)
}

export function getGeolocatedFarms(farms: Farm[]): Farm[] {
  return farms.filter(isValidFarmLocation)
}

export const FARM_REGISTRATION_REQUIRED_MESSAGE =
  'You must register at least one farm with a valid map location before you can submit a GPS incident report.'
