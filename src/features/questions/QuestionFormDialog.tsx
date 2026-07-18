import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { questionSchema, type QuestionFormValues } from './schema'
import type { Question } from '@/types'
import { useToast } from '@/components/ui/toast'

function defaults(initial?: Question): QuestionFormValues {
  return {
    text: initial?.text ?? '',
    priority: initial?.priority ?? 'Medium',
    answered: initial?.answered ?? false,
    answerNotes: initial?.answerNotes ?? '',
  }
}

export function QuestionFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initial,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSubmit: (values: QuestionFormValues) => Promise<void>
  initial?: Question
}) {
  const { toast } = useToast()
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuestionFormValues>({ resolver: zodResolver(questionSchema), defaultValues: defaults(initial) })

  React.useEffect(() => {
    if (open) reset(defaults(initial))
  }, [open, initial, reset])

  async function handle(values: QuestionFormValues) {
    await onSubmit(values)
    toast({ title: initial ? 'Question updated' : 'Question added', variant: 'success' })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit question' : 'Add a question for your neurologist'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handle)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="text">Question</Label>
            <Textarea id="text" placeholder="e.g. Should we adjust medication timing?" {...register('text')} />
            {errors.text && <p className="text-sm text-danger-600">{errors.text.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label>Priority</Label>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4">
                  {(['High', 'Medium', 'Low'] as const).map((p) => (
                    <div key={p} className="flex items-center gap-2">
                      <RadioGroupItem value={p} id={`priority-${p}`} />
                      <Label htmlFor={`priority-${p}`}>{p}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{initial ? 'Save changes' : 'Add question'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
