import { z } from 'zod'

export const fallSchema = z.object({
  date: z.string().min(1),
  time: z.string().min(1),
  location: z.string().min(1, 'Location is required'),
  cause: z.string(),
  injury: z.string(),
  neededHelp: z.boolean(),
  nearFall: z.boolean(),
  notes: z.string().optional(),
})

export type FallFormValues = z.infer<typeof fallSchema>
