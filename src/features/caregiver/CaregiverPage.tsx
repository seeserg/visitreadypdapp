import * as React from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { db } from '@/db/db'
import { useRecords } from '@/hooks/useRecords'
import { CaregiverNoteFormDialog } from './CaregiverNoteFormDialog'
import type { CaregiverNote } from '@/types'
import { formatDate } from '@/lib/utils'

export function CaregiverPage() {
  const { records, add, update, remove } = useRecords(db.caregiverNotes, 'date')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<CaregiverNote | undefined>()

  function openAdd() {
    setEditing(undefined)
    setDialogOpen(true)
  }
  function openEdit(n: CaregiverNote) {
    setEditing(n)
    setDialogOpen(true)
  }

  return (
    <div>
      <PageHeader
        title="Caregiver Notes"
        description="A separate space for caregivers to record observations between visits."
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-5 w-5" /> Add note
          </Button>
        }
      />

      {records.length === 0 ? (
        <EmptyState title="No caregiver notes yet" description="Caregivers can log observations here to share with the care team." />
      ) : (
        <div className="grid gap-3">
          {records.map((n) => (
            <Card key={n.id}>
              <CardContent className="flex items-start justify-between gap-4 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{n.category}</Badge>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{formatDate(n.date)}</span>
                    {n.authorName && <span className="text-sm text-slate-500 dark:text-slate-400">· {n.authorName}</span>}
                  </div>
                  <p className="mt-1 text-slate-700 dark:text-slate-200">{n.observation}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" aria-label="Edit note" onClick={() => openEdit(n)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Delete note" onClick={() => remove(n.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CaregiverNoteFormDialog
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
