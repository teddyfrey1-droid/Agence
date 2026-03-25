import { z } from "zod";
import { InteractionType } from "@prisma/client";

const optionalNullableTrimmedString = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .optional();

const optionalCuid = z.string().cuid().nullable().optional();

const optionalDate = z
  .union([z.string(), z.date()])
  .optional()
  .transform((value) => {
    if (!value) return undefined;
    return value instanceof Date ? value : new Date(value);
  });

export const createInteractionSchema = z.object({
  summary: z.string().trim().min(2, "Résumé requis"),
  details: optionalNullableTrimmedString,
  interactionType: z.nativeEnum(InteractionType).default(InteractionType.INTERNAL_NOTE),
  happenedAt: optionalDate,
  sentiment: optionalNullableTrimmedString,
  nextStep: optionalNullableTrimmedString,
  contactId: optionalCuid,
  propertyId: optionalCuid,
  searchRequestId: optionalCuid,
  dealId: optionalCuid,
});

export const updateInteractionSchema = createInteractionSchema.partial();

export type CreateInteractionInput = z.infer<typeof createInteractionSchema>;
export type UpdateInteractionInput = z.infer<typeof updateInteractionSchema>;
