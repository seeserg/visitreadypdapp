import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { medicationSchema, type MedicationFormValues } from './schema'
import type { Medication } from '@/types'
import { useToast } from '@/components/ui/toast'

function defaults(initial?: Medication): MedicationFormValues {
  return {
    name: initial?.name ?? '',
    strength: initial?.strength ?? '',
    dose: initial?.dose ?? '',
    frequency: initial?.frequency ?? '',
    time: initial?.time ?? '',
    notes: initial?.notes ?? '',
    missedDose: initial?.missedDose ?? false,
    sideEffects: initial?.sideEffects ?? '',
  }
}

export function MedicationFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initial,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSubmit: (values: MedicationFormValues) => Promise<void>
  initial?: Medication
}) {
  const { toast } = useToast()
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MedicationFormValues>({ resolver: zodResolver(medicationSchema), defaultValues: defaults(initial) })

  React.useEffect(() => {
    if (open) reset(defaults(initial))
  }, [open, initial, reset])

  async function handle(values: MedicationFormValues) {
    await onSubmit(values)
    toast({ title: initial ? 'Medication updated' : 'Medication added', variant: 'success' })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit medication' : 'Add medication'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handle)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Medication name</Label>
            <Input id="name" placeholder="e.g. Carbidopa-Levodopa" {...register('name')} />
            {errors.name && <p className="text-sm text-danger-600">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="strength">Strength</Label>
              <Input id="strength" placeholder="e.g. 25/100 mg" {...register('strength')} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dose">Dose</Label>
              <Input id="dose" placeholder="e.g. 1 tablet" {...register('dose')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Input id="frequency" placeholder="e.g. 4x daily" {...register('frequency')} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="time">Time(s)</Label>
              <Input id="time" placeholder="e.g. 7am, 11am, 3pm, 7pm" {...register('time')} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="sideEffects">Side effects noticed</Label>
            <Textarea id="sideEffects" placeholder="Optional…" {...register('sideEffects')} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Optional…" {...register('notes')} />
          </div>
          <div className="flex items-center gap-3">
            <Controller
              control={control}
              name="missedDose"
              render={({ field }) => (
                <Checkbox id="missedDose" checked={field.value} onCheckedChange={(v) => field.onChange(!!v)} />
              )}
            />
            <Label htmlFor="missedDose">Dose was missed recently</Label>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{initial ? 'Save changes' : 'Add medication'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
