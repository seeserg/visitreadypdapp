import { z } from 'zod'

export const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  strength: z.string(),
  dose: z.string(),
  frequency: z.string(),
  time: z.string(),
  notes: z.string().optional(),
  missedDose: z.boolean(),
  sideEffects: z.string().optional(),
})

export type MedicationFormValues = z.infer<typeof medicationSchema>
