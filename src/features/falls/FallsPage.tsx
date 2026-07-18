import * as React from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { db } from '@/db/db'
import { useRecords } from '@/hooks/useRecords'
import { FallFormDialog } from './FallFormDialog'
import { FallsChart } from './FallsChart'
import type { FallEntry } from '@/types'
import { formatDateTime } from '@/lib/utils'

export function FallsPage() {
  const { records, add, update, remove } = useRecords(db.falls, 'date')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<FallEntry | undefined>()

  function openAdd() {
    setEditing(undefined)
    setDialogOpen(true)
  }
  function openEdit(f: FallEntry) {
    setEditing(f)
    setDialogOpen(true)
  }

  return (
    <div>
      <PageHeader
        title="Falls"
        description="Record falls and near falls to help identify patterns and risks."
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-5 w-5" /> Log fall
          </Button>
        }
      />

      {records.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Falls by month</CardTitle>
          </CardHeader>
          <CardContent>
            <FallsChart entries={records} />
          </CardContent>
        </Card>
      )}

      {records.length === 0 ? (
        <EmptyState title="No falls logged" description="If a fall or near fall happens, log it here to share with your care team." />
      ) : (
        <div className="grid gap-3">
          {records.map((f) => (
            <Card key={f.id}>
              <CardContent className="flex items-start justify-between gap-4 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-50">{f.location}</span>
                    {f.nearFall && <Badge variant="warning">Near fall</Badge>}
                    {!f.nearFall && <Badge variant="danger">Fall</Badge>}
                    {f.neededHelp && <Badge variant="neutral">Needed help</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatDateTime(`${f.date}T${f.time}`)}</p>
                  {f.cause && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Cause: {f.cause}</p>}
                  {f.injury && <p className="text-sm text-slate-600 dark:text-slate-300">Injury: {f.injury}</p>}
                  {f.notes && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{f.notes}</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" aria-label="Edit fall" onClick={() => openEdit(f)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Delete fall" onClick={() => remove(f.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <FallFormDialog
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
