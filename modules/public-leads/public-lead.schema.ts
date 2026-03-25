import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .transform((value) => value === "" ? undefined : value)
  .optional();

export const publicSearchLeadSchema = z.object({
  fullName: z.string().trim().min(2, "Nom requis"),
  email: z.string().trim().email("Email invalide").transform((value) => value.toLowerCase()),
  phone: optionalString,
  activity: optionalString,
  budgetMax: optionalString,
  areaMin: optionalString,
  targetArrondissements: z.array(z.string().trim()).default([]),
  extractionRequired: z.boolean().nullable().optional(),
  company: optionalString, // honeypot
});

export const publicPropertySubmissionSchema = z.object({
  fullName: z.string().trim().min(2, "Nom requis"),
  email: z.string().trim().email("Email invalide").transform((value) => value.toLowerCase()),
  phone: optionalString,
  addressText: z.string().trim().min(4, "Adresse requise"),
  surface: optionalString,
  rentOrPrice: optionalString,
  notes: optionalString,
  photoCoverUrl: optionalString,
  company: optionalString, // honeypot
});

export const publicContactLeadSchema = z.object({
  fullName: z.string().trim().min(2, "Nom requis"),
  email: z.string().trim().email("Email invalide").transform((value) => value.toLowerCase()),
  phone: optionalString,
  message: z.string().trim().min(10, "Message trop court"),
  company: optionalString, // honeypot
});

export type PublicSearchLeadInput = z.infer<typeof publicSearchLeadSchema>;
export type PublicPropertySubmissionInput = z.infer<typeof publicPropertySubmissionSchema>;
export type PublicContactLeadInput = z.infer<typeof publicContactLeadSchema>;
