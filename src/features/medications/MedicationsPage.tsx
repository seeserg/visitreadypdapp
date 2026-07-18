import * as React from 'react'
import { Plus, Pencil, Trash2, AlertCircle } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { db } from '@/db/db'
import { useRecords } from '@/hooks/useRecords'
import { MedicationFormDialog } from './MedicationFormDialog'
import type { Medication } from '@/types'

export function MedicationsPage() {
  const { records, add, update, remove } = useRecords(db.medications, 'name')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Medication | undefined>()

  function openAdd() {
    setEditing(undefined)
    setDialogOpen(true)
  }
  function openEdit(m: Medication) {
    setEditing(m)
    setDialogOpen(true)
  }

  return (
    <div>
      <PageHeader
        title="Medications"
        description="Keep an accurate list of what you're taking to review with your neurologist."
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-5 w-5" /> Add medication
          </Button>
        }
      />

      {records.length === 0 ? (
        <EmptyState title="No medications added yet" description="Add your current medications so they're ready for your next visit." />
      ) : (
        <div className="grid gap-3">
          {records.map((m) => (
            <Card key={m.id}>
              <CardContent className="flex items-start justify-between gap-4 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-50">{m.name}</span>
                    {m.strength && <Badge variant="neutral">{m.strength}</Badge>}
                    {m.missedDose && (
                      <Badge variant="warning">
                        <AlertCircle className="mr-1 h-3 w-3" /> Missed dose
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {[m.dose, m.frequency, m.time].filter(Boolean).join(' · ')}
                  </p>
                  {m.sideEffects && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Side effects: {m.sideEffects}</p>}
                  {m.notes && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{m.notes}</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" aria-label={`Edit ${m.name}`} onClick={() => openEdit(m)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label={`Delete ${m.name}`} onClick={() => remove(m.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <MedicationFormDialog
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
