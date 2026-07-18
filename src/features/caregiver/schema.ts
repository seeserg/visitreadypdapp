import { z } from 'zod'

export const CAREGIVER_CATEGORIES = [
  'Mobility',
  'Memory',
  'Sleep',
  'Mood',
  'Eating',
  'Medication adherence',
  'Safety concerns',
] as const

export const caregiverNoteSchema = z.object({
  category: z.enum(CAREGIVER_CATEGORIES),
  observation: z.string().min(1, 'Observation is required'),
  date: z.string().min(1),
  authorName: z.string().optional(),
})

export type CaregiverNoteFormValues = z.infer<typeof caregiverNoteSchema>
