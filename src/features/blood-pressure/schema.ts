import { z } from 'zod'

const numOrUndef = z.preprocess(
  (v) => (v === '' || v === undefined || v === null ? undefined : Number(v)),
  z.number().min(0).max(300).optional()
)

export const bpSchema = z.object({
  date: z.string().min(1),
  time: z.string().min(1),
  lyingSystolic: numOrUndef,
  lyingDiastolic: numOrUndef,
  sittingSystolic: numOrUndef,
  sittingDiastolic: numOrUndef,
  standingSystolic: numOrUndef,
  standingDiastolic: numOrUndef,
  heartRate: numOrUndef,
  dizziness: z.boolean(),
  lightheaded: z.boolean(),
  blurredVision: z.boolean(),
  nearFainting: z.boolean(),
  hydration: z.string().optional(),
  temperature: z.string().optional(),
  notes: z.string().optional(),
})

export type BpFormValues = z.infer<typeof bpSchema>
