import * as React from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { db } from '@/db/db'
import { useRecords } from '@/hooks/useRecords'
import { BpFormDialog } from './BpFormDialog'
import { BpChart } from './BpChart'
import type { BloodPressureEntry } from '@/types'
import { formatDateTime } from '@/lib/utils'

function fmtReading(sys?: number, dia?: number) {
  if (sys == null && dia == null) return '—'
  return `${sys ?? '—'}/${dia ?? '—'}`
}

export function BloodPressurePage() {
  const { records, add, update, remove } = useRecords(db.bloodPressure, 'date')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<BloodPressureEntry | undefined>()

  function openAdd() {
    setEditing(undefined)
    setDialogOpen(true)
  }
  function openEdit(e: BloodPressureEntry) {
    setEditing(e)
    setDialogOpen(true)
  }

  const orthostaticFlags = (e: BloodPressureEntry) =>
    [e.dizziness && 'Dizziness', e.lightheaded && 'Lightheaded', e.blurredVision && 'Blurred vision', e.nearFainting && 'Near fainting'].filter(
      Boolean
    ) as string[]

  return (
    <div>
      <PageHeader
        title="Blood Pressure"
        description="Track lying, sitting, and standing readings to spot orthostatic patterns."
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-5 w-5" /> Log reading
          </Button>
        }
      />

      {records.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <BpChart entries={records} />
          </CardContent>
        </Card>
      )}

      {records.length === 0 ? (
        <EmptyState title="No blood pressure readings yet" description="Log a reading to start tracking trends and orthostatic symptoms." />
      ) : (
        <div className="grid gap-3">
          {records.map((e) => {
            const flags = orthostaticFlags(e)
            return (
              <Card key={e.id}>
                <CardContent className="flex items-start justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                      <span>
                        <span className="text-slate-500 dark:text-slate-400">Lying </span>
                        <span className="font-medium">{fmtReading(e.lyingSystolic, e.lyingDiastolic)}</span>
                      </span>
                      <span>
                        <span className="text-slate-500 dark:text-slate-400">Sitting </span>
                        <span className="font-medium">{fmtReading(e.sittingSystolic, e.sittingDiastolic)}</span>
                      </span>
                      <span>
                        <span className="text-slate-500 dark:text-slate-400">Standing </span>
                        <span className="font-medium">{fmtReading(e.standingSystolic, e.standingDiastolic)}</span>
                      </span>
                      {e.heartRate != null && (
                        <span>
                          <span className="text-slate-500 dark:text-slate-400">HR </span>
                          <span className="font-medium">{e.heartRate} bpm</span>
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatDateTime(`${e.date}T${e.time}`)}</p>
                    {flags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {flags.map((f) => (
                          <Badge key={f} variant="warning">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {e.notes && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{e.notes}</p>}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" aria-label="Edit reading" onClick={() => openEdit(e)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Delete reading" onClick={() => remove(e.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <BpFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={async (values) => {
          if (editing) await update(editing.id, values)
          else await add(values)
        }}
      />
    </div>
  )
}
