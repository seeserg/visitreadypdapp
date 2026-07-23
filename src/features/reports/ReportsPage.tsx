import * as React from 'react'
import { FileDown, FileText } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { db } from '@/db/db'
import { useSettings } from '@/context/SettingsContext'
import { generateAppointmentReport } from '@/lib/pdfReport'
import { useToast } from '@/components/ui/toast'
import { getLastAppointment } from '@/features/appointments/utils'
import { formatDate } from '@/lib/utils'
import type { SymptomEntry, FallEntry, BloodPressureEntry, CaregiverNote, JournalEntry } from '@/types'

type RangeMode = 'all' | 'since-last' | 'custom'

function inRange<T extends { date: string }>(entries: T[], start: string | null, end: string | null) {
  return entries.filter((e) => (!start || e.date >= start) && (!end || e.date <= end))
}

export function ReportsPage() {
  const { settings } = useSettings()
  const { toast } = useToast()
  const [generating, setGenerating] = React.useState(false)
  const [rangeMode, setRangeMode] = React.useState<RangeMode>('all')
  const [customStart, setCustomStart] = React.useState('')
  const [customEnd, setCustomEnd] = React.useState('')

  const appointments = useLiveQuery(() => db.appointments.toArray(), [])
  const lastAppointment = appointments ? getLastAppointment(appointments) : undefined

  const counts = useLiveQuery(async () => ({
    symptoms: await db.symptoms.count(),
    medications: await db.medications.count(),
    bloodPressure: await db.bloodPressure.count(),
    falls: await db.falls.count(),
    questions: await db.questions.count(),
    caregiverNotes: await db.caregiverNotes.count(),
    journal: await db.journal.count(),
  }))

  const rangeStart = rangeMode === 'since-last' ? lastAppointment?.date ?? null : rangeMode === 'custom' ? customStart || null : null
  const rangeEnd = rangeMode === 'custom' ? customEnd || null : null

  const rangeLabel =
    rangeMode === 'all'
      ? 'All time'
      : rangeMode === 'since-last'
        ? lastAppointment
          ? `Since your last appointment (${formatDate(lastAppointment.date)})`
          : 'All time (no prior appointment on record)'
        : `${customStart ? formatDate(customStart) : 'Beginning'} – ${customEnd ? formatDate(customEnd) : 'Now'}`

  async function handleGenerate() {
    setGenerating(true)
    try {
      const [allSymptoms, medications, allBp, allFalls, questions, allCaregiverNotes, allJournal] = await Promise.all([
        db.symptoms.toArray(),
        db.medications.toArray(),
        db.bloodPressure.toArray(),
        db.falls.toArray(),
        db.questions.toArray(),
        db.caregiverNotes.toArray(),
        db.journal.toArray(),
      ])

      const symptoms = inRange<SymptomEntry>(allSymptoms, rangeStart, rangeEnd)
      const bloodPressure = inRange<BloodPressureEntry>(allBp, rangeStart, rangeEnd)
      const falls = inRange<FallEntry>(allFalls, rangeStart, rangeEnd)
      const caregiverNotes = inRange<CaregiverNote>(allCaregiverNotes, rangeStart, rangeEnd)
      const journal = inRange<JournalEntry>(allJournal, rangeStart, rangeEnd)

      // Prior period of equal length, for trend callouts — only meaningful when the range has a defined start
      let previous: { symptoms: SymptomEntry[]; falls: FallEntry[] } | undefined
      if (rangeStart) {
        const start = new Date(rangeStart)
        const end = rangeEnd ? new Date(rangeEnd) : new Date()
        const lengthMs = end.getTime() - start.getTime()
        const prevEnd = new Date(start.getTime() - 1)
        const prevStart = new Date(prevEnd.getTime() - lengthMs)
        const prevStartStr = prevStart.toISOString().slice(0, 10)
        const prevEndStr = prevEnd.toISOString().slice(0, 10)
        previous = {
          symptoms: inRange<SymptomEntry>(allSymptoms, prevStartStr, prevEndStr),
          falls: inRange<FallEntry>(allFalls, prevStartStr, prevEndStr),
        }
      }

      const bytes = await generateAppointmentReport({
        patient: settings.patient,
        rangeLabel,
        symptoms,
        medications,
        bloodPressure,
        falls,
        questions,
        caregiverNotes,
        journal,
        previous,
      })
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `VisitReadyPD-Report-${new Date().toISOString().slice(0, 10)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast({ title: 'Report generated', description: 'Your PDF has been downloaded.', variant: 'success' })
    } catch {
      toast({ title: 'Something went wrong', description: 'Could not generate the report. Please try again.', variant: 'warning' })
    } finally {
      setGenerating(false)
    }
  }

  const rows = [
    ['Symptom entries', counts?.symptoms],
    ['Medications', counts?.medications],
    ['Blood pressure readings', counts?.bloodPressure],
    ['Falls / near falls', counts?.falls],
    ['Questions', counts?.questions],
    ['Caregiver notes', counts?.caregiverNotes],
    ['Journal entries', counts?.journal],
  ] as const

  return (
    <div>
      <PageHeader title="Reports" description="Generate a professional PDF summary to bring to your appointment." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Report</CardTitle>
            <CardDescription>
              Includes medications, symptom trends, blood pressure, falls, questions, caregiver notes, and journal highlights.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label>Report range</Label>
              <RadioGroup value={rangeMode} onValueChange={(v) => setRangeMode(v as RangeMode)} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="all" id="range-all" />
                  <Label htmlFor="range-all">All time</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="since-last" id="range-since-last" />
                  <Label htmlFor="range-since-last">
                    Since your last appointment{lastAppointment ? ` (${formatDate(lastAppointment.date)})` : ' (none on record)'}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="custom" id="range-custom" />
                  <Label htmlFor="range-custom">Custom range</Label>
                </div>
              </RadioGroup>
              {rangeMode === 'custom' && (
                <div className="mt-1 grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="range-start" className="text-xs">
                      Start date
                    </Label>
                    <Input id="range-start" type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="range-end" className="text-xs">
                      End date
                    </Label>
                    <Input id="range-end" type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
                  </div>
                </div>
              )}
            </div>

            <Button size="lg" onClick={handleGenerate} disabled={generating}>
              <FileDown className="h-5 w-5" /> {generating ? 'Generating…' : 'Generate & Download PDF'}
            </Button>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Adding your name and other details in Settings is entirely optional — reports work fine without any personal
              information.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What's included</CardTitle>
            <CardDescription>Totals across all time — the generated report is scoped to your selected range above.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {rows.map(([label, count]) => (
                <li key={label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <FileText className="h-4 w-4 text-primary-600 dark:text-primary-300" />
                    {label}
                  </span>
                  <span className="font-medium text-slate-900 dark:text-slate-50">{count ?? 0}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
