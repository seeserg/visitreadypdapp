import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { symptomSchema, type SymptomFormValues } from './schema'
import { SYMPTOM_TYPES, type SymptomEntry } from '@/types'
import { useToast } from '@/components/ui/toast'

const SEVERITY_LABELS = ['None', 'Mild', 'Mild-Moderate', 'Moderate', 'Severe', 'Very Severe']

function nowDefaults(initial?: SymptomEntry): SymptomFormValues {
  const now = new Date()
  return {
    type: initial?.type ?? 'Tremor',
    severity: initial?.severity ?? 2,
    date: initial?.date ?? now.toISOString().slice(0, 10),
    time: initial?.time ?? now.toTimeString().slice(0, 5),
    notes: initial?.notes ?? '',
    medState: initial?.medState ?? 'Unknown',
  }
}

export function SymptomFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initial,
  defaultType,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSubmit: (values: SymptomFormValues) => Promise<void>
  initial?: SymptomEntry
  defaultType?: SymptomEntry['type']
}) {
  const { toast } = useToast()
  const { control, register, handleSubmit, reset, watch } = useForm<SymptomFormValues>({
    resolver: zodResolver(symptomSchema),
    defaultValues: nowDefaults(initial),
  })

  React.useEffect(() => {
    if (open) reset({ ...nowDefaults(initial), type: initial?.type ?? defaultType ?? 'Tremor' })
  }, [open, initial, defaultType, reset])

  const severity = watch('severity')

  async function handle(values: SymptomFormValues) {
    await onSubmit(values)
    toast({ title: initial ? 'Symptom updated' : 'Symptom logged', variant: 'success' })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit symptom' : 'Log a symptom'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handle)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="symptom-type">Symptom</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="symptom-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SYMPTOM_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="severity">
              Severity: {severity} — {SEVERITY_LABELS[severity]}
            </Label>
            <Controller
              control={control}
              name="severity"
              render={({ field }) => (
                <Slider
                  id="severity"
                  min={0}
                  max={5}
                  step={1}
                  value={[field.value]}
                  onValueChange={(v) => field.onChange(v[0])}
                  aria-label="Severity"
                />
              )}
            />
          </div>

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
            <Label>Medication status</Label>
            <Controller
              control={control}
              name="medState"
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4">
                  {(['ON', 'OFF', 'Unknown'] as const).map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <RadioGroupItem value={s} id={`med-${s}`} />
                      <Label htmlFor={`med-${s}`}>{s}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Optional details…" {...register('notes')} />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{initial ? 'Save changes' : 'Log symptom'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
