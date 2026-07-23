import Dexie, { type Table } from 'dexie'
import type {
  SymptomEntry,
  Medication,
  BloodPressureEntry,
  FallEntry,
  Question,
  CaregiverNote,
  Appointment,
  JournalEntry,
  AppSettings,
} from '@/types'

export class VisitReadyDB extends Dexie {
  symptoms!: Table<SymptomEntry, string>
  medications!: Table<Medication, string>
  bloodPressure!: Table<BloodPressureEntry, string>
  falls!: Table<FallEntry, string>
  questions!: Table<Question, string>
  caregiverNotes!: Table<CaregiverNote, string>
  appointments!: Table<Appointment, string>
  journal!: Table<JournalEntry, string>
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
    this.version(2).stores({
      appointments: 'id, date, createdAt',
      journal: 'id, date, createdAt',
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
  patient: {},
}

export async function getSettings(): Promise<AppSettings> {
  const existing = await db.settings.get('settings')
  if (existing) return existing
  await db.settings.put(DEFAULT_SETTINGS)
  return DEFAULT_SETTINGS
}

/** Permanently deletes every record in every table, including settings. Cannot be undone. */
export async function eraseAllData(): Promise<void> {
  await db.transaction(
    'rw',
    [db.symptoms, db.medications, db.bloodPressure, db.falls, db.questions, db.caregiverNotes, db.appointments, db.journal, db.settings],
    async () => {
      await Promise.all([
        db.symptoms.clear(),
        db.medications.clear(),
        db.bloodPressure.clear(),
        db.falls.clear(),
        db.questions.clear(),
        db.caregiverNotes.clear(),
        db.appointments.clear(),
        db.journal.clear(),
        db.settings.clear(),
      ])
    }
  )
}
