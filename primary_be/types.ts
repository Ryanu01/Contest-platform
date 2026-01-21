import { z } from "zod"

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
  correctOptionIndex: z.string(),
  points: z.string()
})

export const McqSubmissionSchema = z.object({
  selectedOptionIndex: z.string()
})

const testCasesSchema = z.object({
  input: z.string(),
  expectedOutPut: z.string(),
  isHeaden: z.boolean()
})

export const DsaSchma = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.string().array(),
  points: z.string(),
  timeLimit: z.string(),
  memoryLimit: z.string(),
  testCases: testCasesSchema.array()
})

const languageSchema = z.object({
  javascript: z.string()
})

export const DsaSubmissionSchema = z.object({
  code: z.string(),
  language: languageSchema
})
