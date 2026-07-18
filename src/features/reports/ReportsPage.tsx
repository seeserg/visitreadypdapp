import * as React from 'react'
import { FileDown, FileText } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { db } from '@/db/db'
import { useSettings } from '@/context/SettingsContext'
import { generateAppointmentReport } from '@/lib/pdfReport'
import { useToast } from '@/components/ui/toast'
import { useLiveQuery } from 'dexie-react-hooks'

export function ReportsPage() {
  const { settings } = useSettings()
  const { toast } = useToast()
  const [generating, setGenerating] = React.useState(false)

  const counts = useLiveQuery(async () => ({
    symptoms: await db.symptoms.count(),
    medications: await db.medications.count(),
    bloodPressure: await db.bloodPressure.count(),
    falls: await db.falls.count(),
    questions: await db.questions.count(),
    caregiverNotes: await db.caregiverNotes.count(),
  }))

  async function handleGenerate() {
    setGenerating(true)
    try {
      const [symptoms, medications, bloodPressure, falls, questions, caregiverNotes] = await Promise.all([
        db.symptoms.toArray(),
        db.medications.toArray(),
        db.bloodPressure.toArray(),
        db.falls.toArray(),
        db.questions.toArray(),
        db.caregiverNotes.toArray(),
      ])
      const bytes = await generateAppointmentReport({
        patient: settings.patient,
        symptoms,
        medications,
        bloodPressure,
        falls,
        questions,
        caregiverNotes,
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
  ] as const

  return (
    <div>
      <PageHeader title="Reports" description="Generate a professional PDF summary to bring to your appointment." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Report</CardTitle>
            <CardDescription>
              Includes patient info, medications, symptom trends, blood pressure, falls, questions, and caregiver notes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button size="lg" onClick={handleGenerate} disabled={generating}>
              <FileDown className="h-5 w-5" /> {generating ? 'Generating…' : 'Generate & Download PDF'}
            </Button>
            {!settings.patient.name && (
              <p className="text-sm text-warning-600">
                Tip: Add your name and appointment details in Settings for a more complete report.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What's included</CardTitle>
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
