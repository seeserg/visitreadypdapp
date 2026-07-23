import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { appointmentSchema, type AppointmentFormValues } from './schema'
import type { Appointment } from '@/types'
import { useToast } from '@/components/ui/toast'

function defaults(initial?: Appointment): AppointmentFormValues {
  return {
    date: initial?.date ?? new Date().toISOString().slice(0, 10),
    neurologistName: initial?.neurologistName ?? '',
    location: initial?.location ?? '',
    notes: initial?.notes ?? '',
  }
}

export function AppointmentFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initial,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSubmit: (values: AppointmentFormValues) => Promise<void>
  initial?: Appointment
}) {
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormValues>({ resolver: zodResolver(appointmentSchema), defaultValues: defaults(initial) })

  React.useEffect(() => {
    if (open) reset(defaults(initial))
  }, [open, initial, reset])

  async function handle(values: AppointmentFormValues) {
    await onSubmit(values)
    toast({ title: initial ? 'Appointment updated' : 'Appointment added', variant: 'success' })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit appointment' : 'Add appointment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handle)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="appt-date">Date</Label>
            <Input id="appt-date" type="date" {...register('date')} />
            {errors.date && <p className="text-sm text-danger-600">{errors.date.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="appt-neuro">Neurologist</Label>
            <Input id="appt-neuro" placeholder="Optional" {...register('neurologistName')} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="appt-location">Location</Label>
            <Input id="appt-location" placeholder="Optional" {...register('location')} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="appt-notes">Notes</Label>
            <Textarea id="appt-notes" placeholder="Optional" {...register('notes')} />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{initial ? 'Save changes' : 'Add appointment'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
