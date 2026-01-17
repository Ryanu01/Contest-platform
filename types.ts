import { email, z } from "zod"

export const SignInSchema = z.object({
    name: z.string(),
    email: z.email(),
    password: z.string().min(6),
    role: z.enum(["creator", "contestee"])
})

export const LoginSchema = z.object({
    email: z.email(),
    password: z.string()
})

export const ContestSchema = z.object({
    title: z.string(),
    description: z.string(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date()
})

export const McqSchema = z.object({
  questionText: z.string(),
  options: z.string().array(),
  correctOptionIndex: z.number(),
  points: z.number()
})

export const McqSubmissionSchema = z.object({
    selectedOptionIndex: z.number()
})