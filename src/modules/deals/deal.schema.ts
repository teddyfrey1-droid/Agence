import { z } from "zod";
import { DealStage, DealStatus, DealType, PriorityLevel } from "@prisma/client";

const optionalTrimmedString = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value))
  .optional();

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

const optionalDate = z
  .union([z.string(), z.date()])
  .optional()
  .transform((value) => {
    if (!value) return undefined;
    return value instanceof Date ? value : new Date(value);
  });

export const createDealSchema = z.object({
  title: z.string().trim().min(2, "Titre requis"),
  type: z.nativeEnum(DealType).default(DealType.LOCATION),
  status: z.nativeEnum(DealStatus).default(DealStatus.OPEN),
  stage: z.nativeEnum(DealStage).default(DealStage.NOUVEAU),
  priorityLevel: z.nativeEnum(PriorityLevel).default(PriorityLevel.MEDIUM),
  assignedUserId: z.string().cuid().nullable().optional(),
  contactId: z.string().cuid().nullable().optional(),
  propertyId: z.string().cuid().nullable().optional(),
  searchRequestId: z.string().cuid().nullable().optional(),
  estimatedValue: optionalDecimalString,
  estimatedFees: optionalDecimalString,
  probabilityPercent: z.number().int().min(0).max(100).nullable().optional(),
  expectedCloseDate: optionalDate,
  originSource: optionalNullableTrimmedString,
  lostReason: optionalNullableTrimmedString,
});

export const updateDealSchema = createDealSchema.partial();

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;
