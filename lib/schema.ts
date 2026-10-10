// lib/schema.ts
import { z } from "zod";
export const Extracted = z.object({
  doc_type: z.enum(["prescription", "lab_report", "discharge_summary", "other"]),
  date: z.string().nullable(),
  provider: z.string().nullable(),
  diagnoses: z.array(z.string()),
  allergies: z.array(z.string()),
  meds: z.array(z.object({
    name: z.string(), generic: z.string().nullable(),
    dose: z.string().nullable(), frequency: z.string().nullable(),
  })),
  labs: z.array(z.object({
    name: z.string(), value: z.number(), unit: z.string().nullable(),
  })),
  low_confidence_fields: z.array(z.string()),
});
export type Extracted = z.infer<typeof Extracted>;
