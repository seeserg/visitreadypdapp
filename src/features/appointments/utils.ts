import type { Appointment } from '@/types'
import { parseLocalDate } from '@/lib/utils'

function todayISO() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getNextAppointment(appointments: Appointment[]): Appointment | undefined {
  const today = todayISO()
  return [...appointments]
    .filter((a) => a.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0]
}

export function getLastAppointment(appointments: Appointment[]): Appointment | undefined {
  const today = todayISO()
  return [...appointments]
    .filter((a) => a.date < today)
    .sort((a, b) => b.date.localeCompare(a.date))[0]
}

export function daysBetween(dateStr: string, from: Date = new Date()) {
  const target = parseLocalDate(dateStr)
  const now = new Date(from)
  target.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - now.getTime()) / 86400000)
}
