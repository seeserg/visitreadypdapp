import { z } from 'zod'

export const appointmentSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  neurologistName: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
})

export type AppointmentFormValues = z.infer<typeof appointmentSchema>
