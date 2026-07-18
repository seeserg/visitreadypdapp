import * as React from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { db } from '@/db/db'
import { useRecords } from '@/hooks/useRecords'
import { SymptomFormDialog } from './SymptomFormDialog'
import type { SymptomEntry } from '@/types'
import { formatDateTime } from '@/lib/utils'

function severityVariant(s: number): 'success' | 'warning' | 'danger' {
  return s <= 1 ? 'success' : s <= 3 ? 'warning' : 'danger'
}

export function SymptomsPage() {
  const { records, add, update, remove } = useRecords(db.symptoms, 'date')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<SymptomEntry | undefined>()

  function openAdd() {
    setEditing(undefined)
    setDialogOpen(true)
  }
  function openEdit(entry: SymptomEntry) {
    setEditing(entry)
    setDialogOpen(true)
  }

  return (
    <div>
      <PageHeader
        title="Symptoms"
        description="Track how symptoms change over time to share with your care team."
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-5 w-5" /> Log symptom
          </Button>
        }
      />

      {records.length === 0 ? (
        <EmptyState title="No symptoms logged yet" description="Log your first symptom to start building a picture for your next appointment." />
      ) : (
        <div className="grid gap-3">
          {records.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-50">{s.type}</span>
                    <Badge variant={severityVariant(s.severity)}>Severity {s.severity}/5</Badge>
                    <Badge variant="neutral">{s.medState}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatDateTime(`${s.date}T${s.time}`)}</p>
                  {s.notes && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{s.notes}</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" aria-label={`Edit ${s.type} entry`} onClick={() => openEdit(s)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label={`Delete ${s.type} entry`} onClick={() => remove(s.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SymptomFormDialog
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
