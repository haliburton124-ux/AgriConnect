import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merges Tailwind classes safely, resolving conflicts (shadcn/ui convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}
