import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { fallSchema, type FallFormValues } from './schema'
import type { FallEntry } from '@/types'
import { useToast } from '@/components/ui/toast'

function defaults(initial?: FallEntry): FallFormValues {
  const now = new Date()
  return {
    date: initial?.date ?? now.toISOString().slice(0, 10),
    time: initial?.time ?? now.toTimeString().slice(0, 5),
    location: initial?.location ?? '',
    cause: initial?.cause ?? '',
    injury: initial?.injury ?? '',
    neededHelp: initial?.neededHelp ?? false,
    nearFall: initial?.nearFall ?? false,
    notes: initial?.notes ?? '',
  }
}

export function FallFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initial,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSubmit: (values: FallFormValues) => Promise<void>
  initial?: FallEntry
}) {
  const { toast } = useToast()
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FallFormValues>({ resolver: zodResolver(fallSchema), defaultValues: defaults(initial) })

  React.useEffect(() => {
    if (open) reset(defaults(initial))
  }, [open, initial, reset])

  async function handle(values: FallFormValues) {
    await onSubmit(values)
    toast({ title: initial ? 'Fall updated' : 'Fall logged', variant: 'success' })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit fall' : 'Log a fall or near fall'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handle)} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register('date')} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" {...register('time')} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="e.g. Kitchen, bathroom" {...register('location')} />
            {errors.location && <p className="text-sm text-danger-600">{errors.location.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cause">Cause</Label>
            <Input id="cause" placeholder="e.g. Turned quickly, tripped" {...register('cause')} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="injury">Injury</Label>
            <Input id="injury" placeholder="e.g. None, bruised hip" {...register('injury')} />
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Controller
                control={control}
                name="neededHelp"
                render={({ field }) => (
                  <Checkbox id="neededHelp" checked={field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                )}
              />
              <Label htmlFor="neededHelp">Needed help getting up</Label>
            </div>
            <div className="flex items-center gap-2">
              <Controller
                control={control}
                name="nearFall"
                render={({ field }) => (
                  <Checkbox id="nearFall" checked={field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                )}
              />
              <Label htmlFor="nearFall">This was a near fall (no fall occurred)</Label>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Optional…" {...register('notes')} />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{initial ? 'Save changes' : 'Log fall'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
