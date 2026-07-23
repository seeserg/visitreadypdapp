import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Activity, Pill, HeartPulse, AlertTriangle, HelpCircle, Users, FileText, CalendarClock, History } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { db } from '@/db/db'
import { useSettings } from '@/context/SettingsContext'
import { getNextAppointment, getLastAppointment, daysBetween } from '@/features/appointments/utils'
import { formatDate, formatDateTime } from '@/lib/utils'

export function DashboardPage() {
  const navigate = useNavigate()
  const { settings } = useSettings()

  const symptoms = useLiveQuery(() => db.symptoms.orderBy('date').reverse().limit(3).toArray(), [])
  const medications = useLiveQuery(() => db.medications.toArray(), [])
  const bp = useLiveQuery(() => db.bloodPressure.orderBy('date').reverse().limit(1).toArray(), [])
  const falls = useLiveQuery(() => db.falls.orderBy('date').reverse().limit(3).toArray(), [])
  const notes = useLiveQuery(() => db.caregiverNotes.orderBy('date').reverse().limit(3).toArray(), [])
  const openQuestions = useLiveQuery(() => db.questions.filter((q) => !q.answered).count(), [])
  const appointments = useLiveQuery(() => db.appointments.toArray(), [])

  const nextAppointment = appointments ? getNextAppointment(appointments) : undefined
  const lastAppointment = appointments ? getLastAppointment(appointments) : undefined
  const appointmentDays = nextAppointment ? daysBetween(nextAppointment.date) : null
  const daysSinceLast = lastAppointment ? Math.abs(daysBetween(lastAppointment.date)) : null

  const quickAdds = [
    { label: 'Log symptom', icon: Activity, to: '/symptoms' },
    { label: 'Add medication', icon: Pill, to: '/medications' },
    { label: 'Log blood pressure', icon: HeartPulse, to: '/blood-pressure' },
    { label: 'Log a fall', icon: AlertTriangle, to: '/falls' },
    { label: 'Add question', icon: HelpCircle, to: '/questions' },
    { label: 'Caregiver note', icon: Users, to: '/caregiver-notes' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-accent-700 dark:text-accent-300">{formatDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 sm:text-3xl">
          {settings.patient.name ? `Welcome back, ${settings.patient.name}` : 'Welcome to VisitReady PD'}
        </h1>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 py-5">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <CalendarClock className="h-8 w-8 text-primary-700 dark:text-primary-300" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-50">Upcoming Appointment</p>
                {nextAppointment ? (
                  <p className="text-slate-600 dark:text-slate-300">
                    {formatDate(nextAppointment.date)}
                    {appointmentDays !== null && (
                      <span className="ml-2 text-accent-700 dark:text-accent-300">
                        ({appointmentDays === 0 ? 'Today' : `in ${appointmentDays} days`})
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">No appointment set — add one in Settings.</p>
                )}
              </div>
            </div>
            <Button onClick={() => navigate('/reports')}>
              <FileText className="h-5 w-5" /> Generate Appointment Report
            </Button>
          </div>
          {lastAppointment && (
            <div className="flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <History className="h-5 w-5 shrink-0 text-slate-400" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Last appointment: {formatDate(lastAppointment.date)}
                {daysSinceLast !== null && ` (${daysSinceLast} days ago)`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">Quick Add</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {quickAdds.map((q) => (
            <button
              key={q.label}
              onClick={() => navigate(q.to)}
              className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-center text-sm font-medium text-slate-700 hover:border-primary-300 hover:bg-primary-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-primary-900/30"
            >
              <q.icon className="h-6 w-6 text-primary-700 dark:text-primary-300" />
              {q.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Symptoms</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {!symptoms || symptoms.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No symptoms logged yet.</p>
            ) : (
              symptoms.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{s.type}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={s.severity <= 1 ? 'success' : s.severity <= 3 ? 'warning' : 'danger'}>
                      {s.severity}/5
                    </Badge>
                    <span className="text-slate-500 dark:text-slate-400">{formatDate(s.date)}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Blood Pressure</CardTitle>
          </CardHeader>
          <CardContent>
            {!bp || bp.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No readings logged yet.</p>
            ) : (
              <div className="text-sm">
                <p className="text-slate-800 dark:text-slate-200">
                  Sitting {bp[0].sittingSystolic ?? '—'}/{bp[0].sittingDiastolic ?? '—'} · Standing {bp[0].standingSystolic ?? '—'}/{bp[0].standingDiastolic ?? '—'}
                </p>
                <p className="mt-1 text-slate-500 dark:text-slate-400">{formatDateTime(`${bp[0].date}T${bp[0].time}`)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Falls</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {!falls || falls.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No falls logged.</p>
            ) : (
              falls.map((f) => (
                <div key={f.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{f.location}</span>
                  <span className="text-slate-500 dark:text-slate-400">{formatDate(f.date)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Caregiver Notes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {!notes || notes.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No notes yet.</p>
            ) : (
              notes.map((n) => (
                <div key={n.id} className="text-sm">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{n.category}: </span>
                  <span className="text-slate-600 dark:text-slate-300">{n.observation.slice(0, 60)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between py-5">
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-50">Medications</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{medications?.length ?? 0} tracked</p>
            </div>
            <Pill className="h-8 w-8 text-primary-700 dark:text-primary-300" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between py-5">
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-50">Open Questions</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{openQuestions ?? 0} unanswered</p>
            </div>
            <HelpCircle className="h-8 w-8 text-primary-700 dark:text-primary-300" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
