import { Prisma, PropertySourceType, PropertyStatus, ConfidentialityLevel, AssetType, SpottingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  CreateFieldSpottingInput,
  UpdateFieldSpottingInput,
} from "./field-spotting.schema";
import { fieldSpottingRepository } from "./field-spotting.repository";
import { matchService } from "@/modules/matches/match.service";

function toDecimal(value?: string) {
  if (value === undefined) return undefined;
  return value === null ? null : new Prisma.Decimal(value);
}

export const fieldSpottingService = {
  async createFieldSpotting(params: {
    agencyId: string;
    createdByUserId: string;
    input: CreateFieldSpottingInput;
  }) {
    const { agencyId, createdByUserId, input } = params;

    return prisma.$transaction(async (tx) => {
      const created = await fieldSpottingRepository.create(tx, {
        agency: { connect: { id: agencyId } },
        createdByUser: { connect: { id: createdByUserId } },
        ...(input.assignedUserId
          ? { assignedUser: { connect: { id: input.assignedUserId } } }
          : {}),
        ...(input.ownerContactId
          ? { ownerContact: { connect: { id: input.ownerContactId } } }
          : {}),
        spottingStatus: input.spottingStatus,
        photoCoverUrl: input.photoCoverUrl,
        addressText: input.addressText,
        postalCode: input.postalCode,
        arrondissement: input.arrondissement,
        neighborhood: input.neighborhood,
        latitude: input.latitude,
        longitude: input.longitude,
        quickNote: input.quickNote,
        ownerIdentified: input.ownerIdentified,
        ownerContacted: input.ownerContacted,
        potentialType: input.potentialType,
        storefrontVisible: input.storefrontVisible,
        apparentVacancyStatus: input.apparentVacancyStatus,
        signagePresent: input.signagePresent,
        estimatedArea: toDecimal(input.estimatedArea),
        estimatedLinearFrontage: toDecimal(input.estimatedLinearFrontage),
      });

      await tx.auditLog.create({
        data: {
          agencyId,
          userId: createdByUserId,
          actionType: "CREATED",
          entityType: "FieldSpotting",
          entityId: created.id,
          afterJson: created as unknown as Prisma.InputJsonValue,
        },
      });

      await tx.statusHistory.create({
        data: {
          agencyId,
          entityType: "FieldSpotting",
          entityId: created.id,
          newStatus: created.spottingStatus,
          changedByUserId: createdByUserId,
        },
      });

      return created;
    });
  },

  async updateFieldSpotting(params: {
    agencyId: string;
    fieldSpottingId: string;
    updatedByUserId: string;
    input: UpdateFieldSpottingInput;
  }) {
    const { agencyId, fieldSpottingId, updatedByUserId, input } = params;

    const existing = await fieldSpottingRepository.findById(prisma, fieldSpottingId, agencyId);

    if (!existing) {
      throw new Error("Repérage introuvable");
    }

    return prisma.$transaction(async (tx) => {
      const updated = await fieldSpottingRepository.update(tx, fieldSpottingId, agencyId, {
        ...(input.assignedUserId !== undefined
          ? input.assignedUserId
            ? { assignedUser: { connect: { id: input.assignedUserId } } }
            : { assignedUser: { disconnect: true } }
          : {}),
        ...(input.ownerContactId !== undefined
          ? input.ownerContactId
            ? { ownerContact: { connect: { id: input.ownerContactId } } }
            : { ownerContact: { disconnect: true } }
          : {}),
        ...(input.spottingStatus !== undefined ? { spottingStatus: input.spottingStatus } : {}),
        ...(input.photoCoverUrl !== undefined ? { photoCoverUrl: input.photoCoverUrl } : {}),
        ...(input.addressText !== undefined ? { addressText: input.addressText } : {}),
        ...(input.postalCode !== undefined ? { postalCode: input.postalCode } : {}),
        ...(input.arrondissement !== undefined ? { arrondissement: input.arrondissement } : {}),
        ...(input.neighborhood !== undefined ? { neighborhood: input.neighborhood } : {}),
        ...(input.latitude !== undefined ? { latitude: input.latitude } : {}),
        ...(input.longitude !== undefined ? { longitude: input.longitude } : {}),
        ...(input.quickNote !== undefined ? { quickNote: input.quickNote } : {}),
        ...(input.ownerIdentified !== undefined ? { ownerIdentified: input.ownerIdentified } : {}),
        ...(input.ownerContacted !== undefined ? { ownerContacted: input.ownerContacted } : {}),
        ...(input.potentialType !== undefined ? { potentialType: input.potentialType } : {}),
        ...(input.storefrontVisible !== undefined ? { storefrontVisible: input.storefrontVisible } : {}),
        ...(input.apparentVacancyStatus !== undefined
          ? { apparentVacancyStatus: input.apparentVacancyStatus }
          : {}),
        ...(input.signagePresent !== undefined ? { signagePresent: input.signagePresent } : {}),
        ...(input.estimatedArea !== undefined ? { estimatedArea: toDecimal(input.estimatedArea) } : {}),
        ...(input.estimatedLinearFrontage !== undefined
          ? { estimatedLinearFrontage: toDecimal(input.estimatedLinearFrontage) }
          : {}),
      });

      await tx.auditLog.create({
        data: {
          agencyId,
          userId: updatedByUserId,
          actionType: "UPDATED",
          entityType: "FieldSpotting",
          entityId: updated.id,
          beforeJson: existing as unknown as Prisma.InputJsonValue,
          afterJson: updated as unknown as Prisma.InputJsonValue,
        },
      });

      if (input.spottingStatus && input.spottingStatus !== existing.spottingStatus) {
        await tx.statusHistory.create({
          data: {
            agencyId,
            entityType: "FieldSpotting",
            entityId: updated.id,
            oldStatus: existing.spottingStatus,
            newStatus: input.spottingStatus,
            changedByUserId: updatedByUserId,
          },
        });
      }

      return updated;
    });
  },

  async listFieldSpottings(
    agencyId: string,
    filters: Parameters<typeof fieldSpottingRepository.findMany>[1],
  ) {
    return fieldSpottingRepository.findMany(agencyId, filters);
  },

  async getFieldSpottingById(agencyId: string, fieldSpottingId: string) {
    return fieldSpottingRepository.findById(prisma, fieldSpottingId, agencyId);
  },

  async convertFieldSpottingToProperty(params: {
    agencyId: string;
    fieldSpottingId: string;
    userId: string;
  }) {
    const { agencyId, fieldSpottingId, userId } = params;

    const existing = await fieldSpottingRepository.findById(prisma, fieldSpottingId, agencyId);

    if (!existing) {
      throw new Error("Repérage introuvable");
    }

    if (existing.convertedToPropertyId) {
      return { propertyId: existing.convertedToPropertyId };
    }

    return prisma.$transaction(async (tx) => {
      const property = await tx.property.create({
        data: {
          agencyId,
          createdByUserId: userId,
          assignedUserId: existing.assignedUserId ?? userId,
          internalTitle:
            existing.addressText ||
            `Repérage ${existing.arrondissement ? `Paris ${existing.arrondissement}` : "terrain"}`,
          status: PropertyStatus.DRAFT,
          confidentialityLevel: ConfidentialityLevel.INTERNAL,
          sourceType: PropertySourceType.FIELD_SPOTTING,
          assetType: AssetType.LOCAL_COMMERCIAL,
          addressLine1: existing.addressText,
          postalCode: existing.postalCode,
          city: "Paris",
          arrondissement: existing.arrondissement,
          neighborhood: existing.neighborhood,
          latitude: existing.latitude,
          longitude: existing.longitude,
          totalArea: existing.estimatedArea,
          linearFrontage: existing.estimatedLinearFrontage,
          extractionPossible: null,
          extractionAvailable: null,
          internalComment: existing.quickNote,
          relatedFieldSpotting: { connect: { id: existing.id } },
          isPublishable: false,
          completenessScore: existing.addressText ? 25 : 10,
          ...(existing.ownerContactId
            ? { mainOwnerContact: { connect: { id: existing.ownerContactId } } }
            : {}),
        },
      });

      const updatedSpotting = await tx.fieldSpotting.update({
        where: {
          id: existing.id,
          agencyId,
        },
        data: {
          spottingStatus: SpottingStatus.CONVERTED,
          convertedToPropertyId: property.id,
        },
      });

      await tx.auditLog.create({
        data: {
          agencyId,
          userId,
          actionType: "CONVERTED",
          entityType: "FieldSpotting",
          entityId: existing.id,
          metadataJson: {
            propertyId: property.id,
          },
        },
      });

      await tx.auditLog.create({
        data: {
          agencyId,
          userId,
          actionType: "CREATED",
          entityType: "Property",
          entityId: property.id,
          metadataJson: {
            sourceFieldSpottingId: existing.id,
          },
        },
      });

      await tx.statusHistory.create({
        data: {
          agencyId,
          entityType: "FieldSpotting",
          entityId: existing.id,
          oldStatus: existing.spottingStatus,
          newStatus: updatedSpotting.spottingStatus,
          changedByUserId: userId,
          note: "Repérage converti en bien",
        },
      });

      return { propertyId: property.id };
    });
  },
};
