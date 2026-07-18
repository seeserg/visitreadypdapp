import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { caregiverNoteSchema, CAREGIVER_CATEGORIES, type CaregiverNoteFormValues } from './schema'
import type { CaregiverNote } from '@/types'
import { useToast } from '@/components/ui/toast'

function defaults(initial?: CaregiverNote): CaregiverNoteFormValues {
  return {
    category: initial?.category ?? 'Mobility',
    observation: initial?.observation ?? '',
    date: initial?.date ?? new Date().toISOString().slice(0, 10),
    authorName: initial?.authorName ?? '',
  }
}

export function CaregiverNoteFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initial,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSubmit: (values: CaregiverNoteFormValues) => Promise<void>
  initial?: CaregiverNote
}) {
  const { toast } = useToast()
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CaregiverNoteFormValues>({ resolver: zodResolver(caregiverNoteSchema), defaultValues: defaults(initial) })

  React.useEffect(() => {
    if (open) reset(defaults(initial))
  }, [open, initial, reset])

  async function handle(values: CaregiverNoteFormValues) {
    await onSubmit(values)
    toast({ title: initial ? 'Note updated' : 'Note added', variant: 'success' })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit caregiver note' : 'Add caregiver note'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handle)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CAREGIVER_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="observation">Observation</Label>
            <Textarea id="observation" placeholder="What did you notice?" {...register('observation')} />
            {errors.observation && <p className="text-sm text-danger-600">{errors.observation.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register('date')} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="authorName">Your name</Label>
              <Input id="authorName" placeholder="Optional" {...register('authorName')} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{initial ? 'Save changes' : 'Add note'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
