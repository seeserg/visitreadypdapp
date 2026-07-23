import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { journalSchema, MOOD_OPTIONS, type JournalFormValues } from './schema'
import type { JournalEntry } from '@/types'
import { useToast } from '@/components/ui/toast'

function defaults(initial?: JournalEntry): JournalFormValues {
  return {
    date: initial?.date ?? new Date().toISOString().slice(0, 10),
    text: initial?.text ?? '',
    mood: initial?.mood as JournalFormValues['mood'],
    sleepHours: initial?.sleepHours,
  }
}

export function JournalFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initial,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSubmit: (values: JournalFormValues) => Promise<void>
  initial?: JournalEntry
}) {
  const { toast } = useToast()
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof journalSchema>, unknown, JournalFormValues>({
    resolver: zodResolver(journalSchema),
    defaultValues: defaults(initial),
  })

  React.useEffect(() => {
    if (open) reset(defaults(initial))
  }, [open, initial, reset])

  async function handle(values: JournalFormValues) {
    await onSubmit(values)
    toast({ title: initial ? 'Journal entry updated' : 'Journal entry added', variant: 'success' })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit journal entry' : 'New journal entry'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handle)} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="j-date">Date</Label>
              <Input id="j-date" type="date" {...register('date')} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="j-sleep">Hours slept</Label>
              <Input id="j-sleep" type="number" step="0.5" placeholder="Optional" {...register('sleepHours')} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="j-mood">Mood</Label>
            <Controller
              control={control}
              name="mood"
              render={({ field }) => (
                <Select value={field.value ?? ''} onValueChange={field.onChange}>
                  <SelectTrigger id="j-mood">
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOOD_OPTIONS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="j-text">Journal entry</Label>
            <Textarea id="j-text" placeholder="How are you feeling today?" rows={5} {...register('text')} />
            {errors.text && <p className="text-sm text-danger-600">{errors.text.message}</p>}
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{initial ? 'Save changes' : 'Add entry'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
