import * as React from 'react'
import { Plus, Pencil, Trash2, CalendarClock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { db } from '@/db/db'
import { useRecords } from '@/hooks/useRecords'
import { AppointmentFormDialog } from './AppointmentFormDialog'
import { getNextAppointment } from './utils'
import type { Appointment } from '@/types'
import { formatDate } from '@/lib/utils'

export function AppointmentHistoryCard() {
  const { records, add, update, remove } = useRecords(db.appointments, 'date')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Appointment | undefined>()

  function openAdd() {
    setEditing(undefined)
    setDialogOpen(true)
  }
  function openEdit(a: Appointment) {
    setEditing(a)
    setDialogOpen(true)
  }

  const next = getNextAppointment(records)
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment History</CardTitle>
        <CardDescription>Log past and upcoming appointments. Reports can be scoped to "since your last visit."</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button onClick={openAdd} className="self-start">
          <Plus className="h-5 w-5" /> Add appointment
        </Button>

        {records.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No appointments logged yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sorted.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <CalendarClock className="h-5 w-5 shrink-0 text-primary-700 dark:text-primary-300" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-slate-50">{formatDate(a.date)}</span>
                      {next?.id === a.id && <Badge variant="accent">Upcoming</Badge>}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {[a.neurologistName, a.location].filter(Boolean).join(' · ') || a.notes || undefined}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" aria-label="Edit appointment" onClick={() => openEdit(a)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Delete appointment" onClick={() => remove(a.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <AppointmentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={async (values) => {
          if (editing) await update(editing.id, values)
          else await add(values)
        }}
      />
    </Card>
  )
}
