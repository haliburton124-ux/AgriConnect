export const PH_SUFFIX_OPTIONS = ['Jr.', 'Sr.', 'II', 'III', 'IV'] as const

export type PhSuffix = (typeof PH_SUFFIX_OPTIONS)[number]

const LOCAL_PHONE_PATTERN = /^9\d{9}$/

export function normalizePhilippinePhoneInput(value: string): string {
  let digits = value.replace(/\D/g, '')

  if (digits.startsWith('63')) {
    digits = digits.slice(2)
  } else if (digits.startsWith('0')) {
    digits = digits.slice(1)
  }

  return digits.slice(0, 10)
}

export function isValidPhilippineLocalPhone(value: string): boolean {
  return LOCAL_PHONE_PATTERN.test(value)
}

export function toPhilippineE164(localDigits: string): string {
  return `+63${localDigits}`
}

export function formatPhilippinePhoneDisplay(e164: string): string {
  const digits = e164.replace(/\D/g, '')
  const local = digits.startsWith('63') ? digits.slice(2) : digits.startsWith('0') ? digits.slice(1) : digits
  return local.length === 10 ? `+63 ${local}` : e164
}
