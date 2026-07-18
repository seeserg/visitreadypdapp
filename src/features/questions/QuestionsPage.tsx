import * as React from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { db } from '@/db/db'
import { useRecords } from '@/hooks/useRecords'
import { QuestionFormDialog } from './QuestionFormDialog'
import type { Question } from '@/types'

const priorityVariant = { High: 'danger', Medium: 'warning', Low: 'neutral' } as const
const priorityOrder = { High: 0, Medium: 1, Low: 2 }

export function QuestionsPage() {
  const { records, add, update, remove } = useRecords(db.questions)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Question | undefined>()

  function openAdd() {
    setEditing(undefined)
    setDialogOpen(true)
  }
  function openEdit(q: Question) {
    setEditing(q)
    setDialogOpen(true)
  }

  const sorted = [...records].sort((a, b) => {
    if (a.answered !== b.answered) return a.answered ? 1 : -1
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  return (
    <div>
      <PageHeader
        title="Questions"
        description="Build a running list of questions to ask your neurologist."
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-5 w-5" /> Add question
          </Button>
        }
      />

      {records.length === 0 ? (
        <EmptyState title="No questions yet" description="Add questions as they come to mind so nothing gets forgotten at your visit." />
      ) : (
        <div className="grid gap-3">
          {sorted.map((q) => (
            <Card key={q.id} className={q.answered ? 'opacity-60' : undefined}>
              <CardContent className="flex items-start gap-4 py-4">
                <Checkbox
                  checked={q.answered}
                  onCheckedChange={(v) => update(q.id, { answered: !!v })}
                  aria-label={q.answered ? 'Mark as unanswered' : 'Mark as answered'}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`font-medium text-slate-900 dark:text-slate-50 ${q.answered ? 'line-through' : ''}`}>
                      {q.text}
                    </span>
                    <Badge variant={priorityVariant[q.priority]}>{q.priority}</Badge>
                  </div>
                  {q.answerNotes && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{q.answerNotes}</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" aria-label="Edit question" onClick={() => openEdit(q)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Delete question" onClick={() => remove(q.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <QuestionFormDialog
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
