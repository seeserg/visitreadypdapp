import Dexie, { type Table } from 'dexie'
import type {
  SymptomEntry,
  Medication,
  BloodPressureEntry,
  FallEntry,
  Question,
  CaregiverNote,
  AppSettings,
} from '@/types'

export class VisitReadyDB extends Dexie {
  symptoms!: Table<SymptomEntry, string>
  medications!: Table<Medication, string>
  bloodPressure!: Table<BloodPressureEntry, string>
  falls!: Table<FallEntry, string>
  questions!: Table<Question, string>
  caregiverNotes!: Table<CaregiverNote, string>
  settings!: Table<AppSettings, string>

  constructor() {
    super('visitready-pd')
    this.version(1).stores({
      symptoms: 'id, type, date, severity, createdAt',
      medications: 'id, name, createdAt',
      bloodPressure: 'id, date, createdAt',
      falls: 'id, date, createdAt',
      questions: 'id, priority, answered, createdAt',
      caregiverNotes: 'id, category, date, createdAt',
      settings: 'id',
    })
  }
}

export const db = new VisitReadyDB()

export const DEFAULT_SETTINGS: AppSettings = {
  id: 'settings',
  theme: 'system',
  largeText: false,
  highContrast: false,
  reducedMotion: false,
  units: 'imperial',
  patient: { name: '' },
}

export async function getSettings(): Promise<AppSettings> {
  const existing = await db.settings.get('settings')
  if (existing) return existing
  await db.settings.put(DEFAULT_SETTINGS)
  return DEFAULT_SETTINGS
}
