import { z } from 'zod'
import { SYMPTOM_TYPES } from '@/types'

export const symptomSchema = z.object({
  type: z.enum(SYMPTOM_TYPES),
  severity: z.number().min(0).max(5),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  notes: z.string().optional(),
  medState: z.enum(['ON', 'OFF', 'Unknown']),
})

export type SymptomFormValues = z.infer<typeof symptomSchema>
