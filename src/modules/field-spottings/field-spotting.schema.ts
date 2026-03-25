import { z } from "zod";
import { SpottingStatus } from "@prisma/client";

const optionalNullableTrimmedString = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .optional();

const optionalDecimalString = z
  .union([z.string(), z.number()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === null || value === "") return undefined;
    return String(value);
  });

const optionalNumber = z
  .union([z.string(), z.number()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === null || value === "") return undefined;
    return Number(value);
  });

export const createFieldSpottingSchema = z.object({
  assignedUserId: z.string().cuid().nullable().optional(),
  spottingStatus: z.nativeEnum(SpottingStatus).default(SpottingStatus.SPOTTED),
  photoCoverUrl: optionalNullableTrimmedString,
  addressText: optionalNullableTrimmedString,
  postalCode: optionalNullableTrimmedString,
  arrondissement: optionalNullableTrimmedString,
  neighborhood: optionalNullableTrimmedString,
  latitude: optionalNumber,
  longitude: optionalNumber,
  quickNote: optionalNullableTrimmedString,
  ownerIdentified: z.boolean().default(false),
  ownerContacted: z.boolean().default(false),
  ownerContactId: z.string().cuid().nullable().optional(),
  potentialType: optionalNullableTrimmedString,
  storefrontVisible: z.boolean().nullable().optional(),
  apparentVacancyStatus: z.boolean().nullable().optional(),
  signagePresent: z.boolean().nullable().optional(),
  estimatedArea: optionalDecimalString,
  estimatedLinearFrontage: optionalDecimalString,
});

export const updateFieldSpottingSchema = createFieldSpottingSchema.partial();

export type CreateFieldSpottingInput = z.infer<typeof createFieldSpottingSchema>;
export type UpdateFieldSpottingInput = z.infer<typeof updateFieldSpottingSchema>;
