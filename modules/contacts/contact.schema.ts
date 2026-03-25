import { z } from "zod";
import { ContactType, PriorityLevel, RelationshipStage } from "@prisma/client";

const optionalNullableTrimmedString = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .optional();

export const createContactSchema = z.object({
  fullName: z.string().trim().min(2, "Nom requis"),
  firstName: optionalNullableTrimmedString,
  lastName: optionalNullableTrimmedString,
  email: z
    .string()
    .trim()
    .email("Email invalide")
    .transform((value) => value.toLowerCase())
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  phone: optionalNullableTrimmedString,
  whatsappPhone: optionalNullableTrimmedString,
  preferredContactMethod: optionalNullableTrimmedString,
  source: optionalNullableTrimmedString,
  contactTypePrimary: z.nativeEnum(ContactType).default(ContactType.PROSPECT),
  activitySector: optionalNullableTrimmedString,
  priorityLevel: z.nativeEnum(PriorityLevel).default(PriorityLevel.MEDIUM),
  relationshipStage: z.nativeEnum(RelationshipStage).default(RelationshipStage.NEW),
  notesSummary: optionalNullableTrimmedString,
  ownerUserId: z.string().cuid().nullable().optional(),
});

export const updateContactSchema = createContactSchema.partial();

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
