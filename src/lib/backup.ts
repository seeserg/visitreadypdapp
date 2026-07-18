import { db } from '@/db/db'
import type {
  SymptomEntry,
  Medication,
  BloodPressureEntry,
  FallEntry,
  Question,
  CaregiverNote,
  AppSettings,
} from '@/types'

export interface BackupData {
  version: 1
  exportedAt: string
  symptoms: SymptomEntry[]
  medications: Medication[]
  bloodPressure: BloodPressureEntry[]
  falls: FallEntry[]
  questions: Question[]
  caregiverNotes: CaregiverNote[]
  settings: AppSettings | undefined
}

export async function collectBackupData(): Promise<BackupData> {
  const [symptoms, medications, bloodPressure, falls, questions, caregiverNotes, settings] = await Promise.all([
    db.symptoms.toArray(),
    db.medications.toArray(),
    db.bloodPressure.toArray(),
    db.falls.toArray(),
    db.questions.toArray(),
    db.caregiverNotes.toArray(),
    db.settings.get('settings'),
  ])
  return { version: 1, exportedAt: new Date().toISOString(), symptoms, medications, bloodPressure, falls, questions, caregiverNotes, settings }
}

function download(filename: string, content: BlobPart, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function exportJSON() {
  const data = await collectBackupData()
  download(`visitready-backup-${data.exportedAt.slice(0, 10)}.json`, JSON.stringify(data, null, 2), 'application/json')
}

async function deriveKey(password: string, salt: Uint8Array) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: 250_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

function toBase64(bytes: Uint8Array) {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

function fromBase64(b64: string) {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export async function exportEncryptedJSON(password: string) {
  const data = await collectBackupData()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt)
  const enc = new TextEncoder()
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, enc.encode(JSON.stringify(data)))
  const payload = {
    format: 'visitready-encrypted-v1',
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(ciphertext)),
  }
  download(`visitready-backup-encrypted-${data.exportedAt.slice(0, 10)}.json`, JSON.stringify(payload), 'application/json')
}

export async function decryptBackup(fileText: string, password: string): Promise<BackupData> {
  const payload = JSON.parse(fileText)
  if (payload.format !== 'visitready-encrypted-v1') throw new Error('Not an encrypted VisitReady backup file')
  const salt = fromBase64(payload.salt)
  const iv = fromBase64(payload.iv)
  const key = await deriveKey(password, salt)
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, fromBase64(payload.ciphertext) as BufferSource)
  return JSON.parse(new TextDecoder().decode(plaintext))
}

export async function importBackupData(data: BackupData) {
  await db.transaction(
    'rw',
    [db.symptoms, db.medications, db.bloodPressure, db.falls, db.questions, db.caregiverNotes, db.settings],
    async () => {
      if (data.symptoms) await db.symptoms.bulkPut(data.symptoms)
      if (data.medications) await db.medications.bulkPut(data.medications)
      if (data.bloodPressure) await db.bloodPressure.bulkPut(data.bloodPressure)
      if (data.falls) await db.falls.bulkPut(data.falls)
      if (data.questions) await db.questions.bulkPut(data.questions)
      if (data.caregiverNotes) await db.caregiverNotes.bulkPut(data.caregiverNotes)
      if (data.settings) await db.settings.put(data.settings)
    }
  )
}

function csvEscape(v: unknown) {
  const s = v == null ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function csvSection<T extends object>(title: string, rows: T[]) {
  if (rows.length === 0) return `${title}\n(no records)\n`
  const headers = Object.keys(rows[0]) as (keyof T)[]
  const lines = [headers.join(',')]
  for (const row of rows) lines.push(headers.map((h) => csvEscape(row[h])).join(','))
  return `${title}\n${lines.join('\n')}\n`
}

export async function exportCSV() {
  const data = await collectBackupData()
  const sections = [
    csvSection('Symptoms', data.symptoms),
    csvSection('Medications', data.medications),
    csvSection('Blood Pressure', data.bloodPressure),
    csvSection('Falls', data.falls),
    csvSection('Questions', data.questions),
    csvSection('Caregiver Notes', data.caregiverNotes),
  ]
  download(`visitready-export-${data.exportedAt.slice(0, 10)}.csv`, sections.join('\n'), 'text/csv')
}
