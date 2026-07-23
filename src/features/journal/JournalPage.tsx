import * as React from 'react'
import { Plus, Pencil, Trash2, Moon } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { db } from '@/db/db'
import { useRecords } from '@/hooks/useRecords'
import { JournalFormDialog } from './JournalFormDialog'
import type { JournalEntry } from '@/types'
import { formatDate } from '@/lib/utils'

const moodVariant: Record<string, 'success' | 'accent' | 'neutral' | 'warning' | 'danger'> = {
  Great: 'success',
  Good: 'accent',
  Okay: 'neutral',
  Low: 'warning',
  Difficult: 'danger',
}

export function JournalPage() {
  const { records, add, update, remove } = useRecords(db.journal, 'date')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<JournalEntry | undefined>()

  function openAdd() {
    setEditing(undefined)
    setDialogOpen(true)
  }
  function openEdit(j: JournalEntry) {
    setEditing(j)
    setDialogOpen(true)
  }

  return (
    <div>
      <PageHeader
        title="Journal"
        description="A private, day-by-day record of how things are going — entirely optional, entirely yours."
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-5 w-5" /> New entry
          </Button>
        }
      />

      {records.length === 0 ? (
        <EmptyState title="No journal entries yet" description="Jot down how you're feeling day to day — it can help spot patterns worth mentioning at your visit." />
      ) : (
        <div className="grid gap-3">
          {records.map((j) => (
            <Card key={j.id}>
              <CardContent className="flex items-start justify-between gap-4 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-50">{formatDate(j.date)}</span>
                    {j.mood && <Badge variant={moodVariant[j.mood] ?? 'neutral'}>{j.mood}</Badge>}
                    {j.sleepHours != null && (
                      <Badge variant="neutral">
                        <Moon className="mr-1 h-3 w-3" /> {j.sleepHours}h sleep
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-slate-700 dark:text-slate-200">{j.text}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" aria-label="Edit entry" onClick={() => openEdit(j)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Delete entry" onClick={() => remove(j.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <JournalFormDialog
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
