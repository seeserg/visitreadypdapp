export type MedState = 'ON' | 'OFF' | 'Unknown'

export const SYMPTOM_TYPES = [
  'Tremor',
  'Rigidity',
  'Slowness',
  'Freezing',
  'Balance',
  'Walking',
  'Speech',
  'Swallowing',
  'Sleep',
  'Fatigue',
  'Pain',
  'Dizziness',
  'Orthostatic symptoms',
  'Constipation',
  'Mood',
  'Memory',
  'Hallucinations',
] as const
export type SymptomType = (typeof SYMPTOM_TYPES)[number]

export interface SymptomEntry {
  id: string
  type: SymptomType
  severity: number // 0-5
  date: string // ISO date
  time: string // HH:mm
  notes?: string
  medState: MedState
  createdAt: string
  updatedAt: string
}

export interface Medication {
  id: string
  name: string
  strength: string
  dose: string
  frequency: string
  time: string
  notes?: string
  missedDose: boolean
  sideEffects?: string
  createdAt: string
  updatedAt: string
}

export interface BloodPressureEntry {
  id: string
  date: string
  time: string
  lyingSystolic?: number
  lyingDiastolic?: number
  sittingSystolic?: number
  sittingDiastolic?: number
  standingSystolic?: number
  standingDiastolic?: number
  heartRate?: number
  dizziness: boolean
  lightheaded: boolean
  blurredVision: boolean
  nearFainting: boolean
  hydration?: string
  temperature?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface FallEntry {
  id: string
  date: string
  time: string
  location: string
  cause: string
  injury: string
  neededHelp: boolean
  nearFall: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

export type Priority = 'High' | 'Medium' | 'Low'

export interface Question {
  id: string
  text: string
  priority: Priority
  answered: boolean
  answerNotes?: string
  createdAt: string
  updatedAt: string
}

export type CaregiverCategory =
  | 'Mobility'
  | 'Memory'
  | 'Sleep'
  | 'Mood'
  | 'Eating'
  | 'Medication adherence'
  | 'Safety concerns'

export interface CaregiverNote {
  id: string
  category: CaregiverCategory
  observation: string
  date: string
  authorName?: string
  createdAt: string
  updatedAt: string
}

export interface Appointment {
  id: string
  date: string // ISO date, may be past or future
  neurologistName?: string
  location?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface JournalEntry {
  id: string
  date: string // ISO date
  text: string
  mood?: string
  sleepHours?: number
  createdAt: string
  updatedAt: string
}

export interface PatientInfo {
  name?: string
  dateOfBirth?: string
  diagnosisYear?: string
  neurologistName?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  notes?: string
}

export interface AppSettings {
  id: 'settings'
  theme: 'light' | 'dark' | 'system'
  largeText: boolean
  highContrast: boolean
  reducedMotion: boolean
  units: 'imperial' | 'metric'
  patient: PatientInfo
}
