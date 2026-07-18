import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { bpSchema, type BpFormValues } from './schema'
import type { BloodPressureEntry } from '@/types'
import { useToast } from '@/components/ui/toast'

function defaults(initial?: BloodPressureEntry): BpFormValues {
  const now = new Date()
  return {
    date: initial?.date ?? now.toISOString().slice(0, 10),
    time: initial?.time ?? now.toTimeString().slice(0, 5),
    lyingSystolic: initial?.lyingSystolic,
    lyingDiastolic: initial?.lyingDiastolic,
    sittingSystolic: initial?.sittingSystolic,
    sittingDiastolic: initial?.sittingDiastolic,
    standingSystolic: initial?.standingSystolic,
    standingDiastolic: initial?.standingDiastolic,
    heartRate: initial?.heartRate,
    dizziness: initial?.dizziness ?? false,
    lightheaded: initial?.lightheaded ?? false,
    blurredVision: initial?.blurredVision ?? false,
    nearFainting: initial?.nearFainting ?? false,
    hydration: initial?.hydration ?? '',
    temperature: initial?.temperature ?? '',
    notes: initial?.notes ?? '',
  }
}

function PositionFields({
  label,
  sysName,
  diaName,
  register,
}: {
  label: string
  sysName: 'lyingSystolic' | 'sittingSystolic' | 'standingSystolic'
  diaName: 'lyingDiastolic' | 'sittingDiastolic' | 'standingDiastolic'
  register: ReturnType<typeof useForm<z.input<typeof bpSchema>, unknown, BpFormValues>>['register']
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input type="number" placeholder="Systolic" aria-label={`${label} systolic`} {...register(sysName)} />
        <span className="text-slate-400">/</span>
        <Input type="number" placeholder="Diastolic" aria-label={`${label} diastolic`} {...register(diaName)} />
      </div>
    </div>
  )
}

export function BpFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initial,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSubmit: (values: BpFormValues) => Promise<void>
  initial?: BloodPressureEntry
}) {
  const { toast } = useToast()
  const { control, register, handleSubmit, reset } = useForm<z.input<typeof bpSchema>, unknown, BpFormValues>({
    resolver: zodResolver(bpSchema),
    defaultValues: defaults(initial),
  })

  React.useEffect(() => {
    if (open) reset(defaults(initial))
  }, [open, initial, reset])

  async function handle(values: BpFormValues) {
    await onSubmit(values)
    toast({ title: initial ? 'Reading updated' : 'Reading logged', variant: 'success' })
    onOpenChange(false)
  }

  const checks: { name: keyof BpFormValues; label: string }[] = [
    { name: 'dizziness', label: 'Dizziness' },
    { name: 'lightheaded', label: 'Lightheaded' },
    { name: 'blurredVision', label: 'Blurred vision' },
    { name: 'nearFainting', label: 'Near fainting' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit blood pressure reading' : 'Log blood pressure reading'}</DialogTitle>
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

          <div className="grid gap-4 sm:grid-cols-3">
            <PositionFields label="Lying" sysName="lyingSystolic" diaName="lyingDiastolic" register={register} />
            <PositionFields label="Sitting" sysName="sittingSystolic" diaName="sittingDiastolic" register={register} />
            <PositionFields label="Standing" sysName="standingSystolic" diaName="standingDiastolic" register={register} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="heartRate">Heart rate (bpm)</Label>
              <Input id="heartRate" type="number" {...register('heartRate')} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="hydration">Hydration</Label>
              <Input id="hydration" placeholder="e.g. 2 glasses of water" {...register('hydration')} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Symptoms present</Label>
            <div className="grid grid-cols-2 gap-3">
              {checks.map((c) => (
                <div key={c.name} className="flex items-center gap-2">
                  <Controller
                    control={control}
                    name={c.name}
                    render={({ field }) => (
                      <Checkbox
                        id={c.name}
                        checked={field.value as boolean}
                        onCheckedChange={(v) => field.onChange(!!v)}
                      />
                    )}
                  />
                  <Label htmlFor={c.name}>{c.label}</Label>
                </div>
              ))}
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
            <Button type="submit">{initial ? 'Save changes' : 'Log reading'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
