import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import type {
  SymptomEntry,
  Medication,
  BloodPressureEntry,
  FallEntry,
  Question,
  CaregiverNote,
  PatientInfo,
} from '@/types'
import { formatDate } from '@/lib/utils'

export interface ReportData {
  patient: PatientInfo
  symptoms: SymptomEntry[]
  medications: Medication[]
  bloodPressure: BloodPressureEntry[]
  falls: FallEntry[]
  questions: Question[]
  caregiverNotes: CaregiverNote[]
}

const PAGE_W = 612
const PAGE_H = 792
const MARGIN = 48
const PRIMARY = rgb(0.106, 0.239, 0.384) // deep blue
const ACCENT = rgb(0.118, 0.486, 0.482) // teal
const TEXT = rgb(0.15, 0.15, 0.18)
const MUTED = rgb(0.42, 0.45, 0.5)
const LIGHT = rgb(0.93, 0.95, 0.97)
const DANGER = rgb(0.7, 0.18, 0.18)
const WARNING = rgb(0.72, 0.5, 0.05)

class ReportBuilder {
  doc!: PDFDocument
  page!: PDFPage
  font!: PDFFont
  bold!: PDFFont
  y = PAGE_H - MARGIN
  pageNum = 0

  async init() {
    this.doc = await PDFDocument.create()
    this.doc.setTitle('VisitReady PD — Appointment Summary')
    this.doc.setProducer('VisitReady PD')
    this.font = await this.doc.embedFont(StandardFonts.Helvetica)
    this.bold = await this.doc.embedFont(StandardFonts.HelveticaBold)
    this.newPage()
  }

  newPage() {
    this.page = this.doc.addPage([PAGE_W, PAGE_H])
    this.pageNum++
    this.y = PAGE_H - MARGIN
    if (this.pageNum > 1) {
      this.page.drawText('VisitReady PD — Appointment Summary', {
        x: MARGIN,
        y: PAGE_H - 24,
        size: 8,
        font: this.font,
        color: MUTED,
      })
      this.y = PAGE_H - MARGIN
    }
    this.page.drawText(String(this.pageNum), {
      x: PAGE_W - MARGIN - 10,
      y: 24,
      size: 9,
      font: this.font,
      color: MUTED,
    })
  }

  ensureSpace(needed: number) {
    if (this.y - needed < MARGIN + 20) this.newPage()
  }

  text(str: string, opts: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; x?: number } = {}) {
    const size = opts.size ?? 10
    const font = opts.font ?? this.font
    const x = opts.x ?? MARGIN
    this.ensureSpace(size + 6)
    this.page.drawText(str, { x, y: this.y, size, font, color: opts.color ?? TEXT })
    this.y -= size + 6
  }

  wrapText(str: string, maxWidth: number, size: number, font: PDFFont) {
    const words = str.split(/\s+/)
    const lines: string[] = []
    let cur = ''
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w
      if (font.widthOfTextAtSize(test, size) > maxWidth && cur) {
        lines.push(cur)
        cur = w
      } else {
        cur = test
      }
    }
    if (cur) lines.push(cur)
    return lines
  }

  paragraph(str: string, opts: { size?: number; color?: ReturnType<typeof rgb>; x?: number; maxWidth?: number } = {}) {
    const size = opts.size ?? 10
    const x = opts.x ?? MARGIN
    const maxWidth = opts.maxWidth ?? PAGE_W - MARGIN * 2
    const lines = this.wrapText(str, maxWidth, size, this.font)
    for (const line of lines) this.text(line, { size, color: opts.color, x })
  }

  sectionTitle(title: string) {
    this.ensureSpace(34)
    this.y -= 6
    this.page.drawRectangle({ x: MARGIN, y: this.y - 2, width: 4, height: 16, color: ACCENT })
    this.page.drawText(title, { x: MARGIN + 12, y: this.y, size: 14, font: this.bold, color: PRIMARY })
    this.y -= 22
  }

  hr() {
    this.ensureSpace(12)
    this.page.drawLine({
      start: { x: MARGIN, y: this.y },
      end: { x: PAGE_W - MARGIN, y: this.y },
      thickness: 0.5,
      color: LIGHT,
    })
    this.y -= 12
  }

  keyValueRow(label: string, value: string) {
    this.ensureSpace(16)
    this.page.drawText(label, { x: MARGIN, y: this.y, size: 10, font: this.bold, color: TEXT })
    this.page.drawText(value || '—', { x: MARGIN + 150, y: this.y, size: 10, font: this.font, color: TEXT })
    this.y -= 16
  }

  table(headers: string[], rows: string[][], colWidths: number[]) {
    const rowH = 18
    this.ensureSpace(rowH + 4)
    let x = MARGIN
    this.page.drawRectangle({ x: MARGIN, y: this.y - 4, width: colWidths.reduce((a, b) => a + b, 0), height: rowH, color: LIGHT })
    headers.forEach((h, i) => {
      this.page.drawText(h, { x: x + 4, y: this.y, size: 9, font: this.bold, color: PRIMARY })
      x += colWidths[i]
    })
    this.y -= rowH

    for (const row of rows) {
      this.ensureSpace(rowH)
      x = MARGIN
      row.forEach((cell, i) => {
        const lines = this.wrapText(cell || '—', colWidths[i] - 8, 9, this.font)
        this.page.drawText(lines[0] ?? '', { x: x + 4, y: this.y, size: 9, font: this.font, color: TEXT })
        x += colWidths[i]
      })
      this.y -= rowH
      this.page.drawLine({
        start: { x: MARGIN, y: this.y + rowH - 2 },
        end: { x: MARGIN + colWidths.reduce((a, b) => a + b, 0), y: this.y + rowH - 2 },
        thickness: 0.5,
        color: LIGHT,
      })
    }
    this.y -= 6
  }

  severityBar(severity: number, x: number, y: number, w = 60) {
    const h = 8
    const color = severity <= 1 ? rgb(0.13, 0.64, 0.37) : severity <= 3 ? WARNING : DANGER
    this.page.drawRectangle({ x, y, width: w, height: h, color: LIGHT })
    this.page.drawRectangle({ x, y, width: (w * severity) / 5, height: h, color })
  }
}

export async function generateAppointmentReport(data: ReportData): Promise<Uint8Array> {
  const b = new ReportBuilder()
  await b.init()

  // Cover / header
  b.page.drawRectangle({ x: 0, y: PAGE_H - 110, width: PAGE_W, height: 110, color: PRIMARY })
  b.page.drawText('VisitReady PD', { x: MARGIN, y: PAGE_H - 50, size: 24, font: b.bold, color: rgb(1, 1, 1) })
  b.page.drawText('Appointment Preparation Summary', { x: MARGIN, y: PAGE_H - 74, size: 12, font: b.font, color: rgb(0.85, 0.9, 0.97) })
  b.page.drawText(`Generated ${formatDate(new Date())}`, { x: MARGIN, y: PAGE_H - 92, size: 9, font: b.font, color: rgb(0.75, 0.82, 0.93) })
  b.y = PAGE_H - 132

  // Patient info
  b.sectionTitle('Patient Information')
  b.keyValueRow('Name', data.patient.name)
  b.keyValueRow('Date of birth', data.patient.dateOfBirth ? formatDate(data.patient.dateOfBirth) : '')
  b.keyValueRow('Diagnosis year', data.patient.diagnosisYear ?? '')
  b.keyValueRow('Neurologist', data.patient.neurologistName ?? '')
  b.keyValueRow('Appointment date', data.patient.appointmentDate ? formatDate(data.patient.appointmentDate) : '')
  if (data.patient.emergencyContactName) {
    b.keyValueRow('Emergency contact', `${data.patient.emergencyContactName} ${data.patient.emergencyContactPhone ? '· ' + data.patient.emergencyContactPhone : ''}`)
  }
  b.y -= 8

  // Medications
  b.sectionTitle('Current Medications')
  if (data.medications.length === 0) {
    b.paragraph('No medications recorded.', { color: MUTED })
  } else {
    b.table(
      ['Medication', 'Strength / Dose', 'Frequency', 'Time'],
      data.medications.map((m) => [m.name, [m.strength, m.dose].filter(Boolean).join(' · '), m.frequency, m.time]),
      [170, 150, 100, 96]
    )
    const withEffects = data.medications.filter((m) => m.sideEffects)
    if (withEffects.length) {
      b.text('Reported side effects:', { size: 9, font: b.bold, color: MUTED })
      for (const m of withEffects) b.paragraph(`• ${m.name}: ${m.sideEffects}`, { size: 9, color: MUTED })
    }
  }
  b.y -= 4

  // Symptoms
  b.sectionTitle('Symptom Summary (most recent 25)')
  if (data.symptoms.length === 0) {
    b.paragraph('No symptoms recorded.', { color: MUTED })
  } else {
    const recent = [...data.symptoms].sort((a, c) => `${c.date}${c.time}`.localeCompare(`${a.date}${a.time}`)).slice(0, 25)
    for (const s of recent) {
      b.ensureSpace(18)
      b.page.drawText(`${s.type}`, { x: MARGIN, y: b.y, size: 9, font: b.bold, color: TEXT })
      b.page.drawText(`${formatDate(s.date)}  ${s.medState}`, { x: MARGIN + 140, y: b.y, size: 9, font: b.font, color: MUTED })
      b.severityBar(s.severity, PAGE_W - MARGIN - 70, b.y, 60)
      b.page.drawText(`${s.severity}/5`, { x: PAGE_W - MARGIN - 8, y: b.y, size: 8, font: b.font, color: MUTED })
      b.y -= 16
      if (s.notes) {
        b.paragraph(s.notes, { size: 8, color: MUTED, x: MARGIN + 8 })
      }
    }
    // Average severity by type
    const byType = new Map<string, number[]>()
    for (const s of data.symptoms) byType.set(s.type, [...(byType.get(s.type) ?? []), s.severity])
    b.y -= 6
    b.text('Average severity by symptom type:', { size: 9, font: b.bold, color: MUTED })
    for (const [type, arr] of byType) {
      const avg = arr.reduce((a, x) => a + x, 0) / arr.length
      b.ensureSpace(14)
      b.page.drawText(`${type}`, { x: MARGIN, y: b.y, size: 9, font: b.font, color: TEXT })
      b.severityBar(avg, MARGIN + 140, b.y, 100)
      b.page.drawText(avg.toFixed(1), { x: MARGIN + 246, y: b.y, size: 8, font: b.font, color: MUTED })
      b.y -= 14
    }
  }
  b.y -= 4

  // Blood pressure
  b.sectionTitle('Blood Pressure Summary')
  if (data.bloodPressure.length === 0) {
    b.paragraph('No blood pressure readings recorded.', { color: MUTED })
  } else {
    const recent = [...data.bloodPressure].sort((a, c) => `${c.date}${c.time}`.localeCompare(`${a.date}${a.time}`)).slice(0, 15)
    b.table(
      ['Date', 'Lying', 'Sitting', 'Standing', 'HR', 'Symptoms'],
      recent.map((e) => [
        formatDate(e.date),
        `${e.lyingSystolic ?? '—'}/${e.lyingDiastolic ?? '—'}`,
        `${e.sittingSystolic ?? '—'}/${e.sittingDiastolic ?? '—'}`,
        `${e.standingSystolic ?? '—'}/${e.standingDiastolic ?? '—'}`,
        e.heartRate != null ? String(e.heartRate) : '—',
        [e.dizziness && 'Dizzy', e.lightheaded && 'Lightheaded', e.blurredVision && 'Blurred', e.nearFainting && 'Near-faint']
          .filter(Boolean)
          .join(', '),
      ]),
      [70, 68, 68, 78, 40, 192]
    )
  }
  b.y -= 4

  // Falls
  b.sectionTitle('Falls & Near Falls')
  if (data.falls.length === 0) {
    b.paragraph('No falls recorded.', { color: MUTED })
  } else {
    const fallCount = data.falls.filter((f) => !f.nearFall).length
    const nearCount = data.falls.filter((f) => f.nearFall).length
    b.text(`Total falls: ${fallCount}   ·   Near falls: ${nearCount}`, { size: 9, font: b.bold, color: MUTED })
    b.table(
      ['Date', 'Location', 'Cause', 'Injury', 'Type'],
      data.falls
        .slice()
        .sort((a, c) => c.date.localeCompare(a.date))
        .slice(0, 15)
        .map((f) => [formatDate(f.date), f.location, f.cause, f.injury, f.nearFall ? 'Near fall' : 'Fall']),
      [70, 110, 110, 96, 62]
    )
  }
  b.y -= 4

  // Questions
  b.sectionTitle('Questions for the Neurologist')
  if (data.questions.length === 0) {
    b.paragraph('No questions recorded.', { color: MUTED })
  } else {
    const order = { High: 0, Medium: 1, Low: 2 }
    const sorted = [...data.questions].sort((a, c) => order[a.priority] - order[c.priority])
    for (const q of sorted) {
      b.ensureSpace(16)
      const mark = q.answered ? '[x]' : '[ ]'
      b.page.drawText(`${mark} (${q.priority})`, { x: MARGIN, y: b.y, size: 9, font: b.bold, color: q.priority === 'High' ? DANGER : TEXT })
      const lines = b.wrapText(q.text, PAGE_W - MARGIN * 2 - 90, 9, b.font)
      b.page.drawText(lines[0] ?? '', { x: MARGIN + 90, y: b.y, size: 9, font: b.font, color: TEXT })
      b.y -= 14
      for (const extra of lines.slice(1)) {
        b.ensureSpace(14)
        b.page.drawText(extra, { x: MARGIN + 90, y: b.y, size: 9, font: b.font, color: TEXT })
        b.y -= 14
      }
    }
  }
  b.y -= 4

  // Caregiver notes
  b.sectionTitle('Caregiver Observations')
  if (data.caregiverNotes.length === 0) {
    b.paragraph('No caregiver notes recorded.', { color: MUTED })
  } else {
    for (const n of data.caregiverNotes.slice(0, 20)) {
      b.ensureSpace(16)
      b.page.drawText(`${n.category} — ${formatDate(n.date)}`, { x: MARGIN, y: b.y, size: 9, font: b.bold, color: ACCENT })
      b.y -= 13
      b.paragraph(n.observation, { size: 9, x: MARGIN + 8 })
    }
  }

  // Footer disclaimer on last page
  b.ensureSpace(60)
  b.hr()
  b.paragraph(
    'This document was generated by VisitReady PD for informational and organizational purposes only. It is not a medical device and does not provide diagnoses or treatment recommendations. All data remains on the device that created this report.',
    { size: 8, color: MUTED }
  )

  return b.doc.save()
}
