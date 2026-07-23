import { z } from 'zod'

export const MOOD_OPTIONS = ['Great', 'Good', 'Okay', 'Low', 'Difficult'] as const

export const journalSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  text: z.string().min(1, 'Journal entry cannot be empty'),
  mood: z.enum(MOOD_OPTIONS).optional(),
  sleepHours: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? undefined : Number(v)),
    z.number().min(0).max(24).optional()
  ),
})

export type JournalFormValues = z.infer<typeof journalSchema>
