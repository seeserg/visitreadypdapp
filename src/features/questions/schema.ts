import { z } from 'zod'

export const questionSchema = z.object({
  text: z.string().min(1, 'Question is required'),
  priority: z.enum(['High', 'Medium', 'Low']),
  answered: z.boolean(),
  answerNotes: z.string().optional(),
})

export type QuestionFormValues = z.infer<typeof questionSchema>
