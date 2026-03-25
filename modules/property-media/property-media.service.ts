import { prisma } from "@/lib/prisma";
import { assertAllowedImage, saveUploadedFile } from "@/lib/uploads";
import { propertyMediaRepository } from "./property-media.repository";

export const propertyMediaService = {
  async uploadPropertyMedia(params: {
    agencyId: string;
    uploadedByUserId: string;
    propertyId: string;
    file: File;
    title?: string;
    isPublic?: boolean;
  }) {
    const { agencyId, uploadedByUserId, propertyId, file, title, isPublic } = params;

    assertAllowedImage(file);

    const property = await prisma.property.findFirst({
      where: { id: propertyId, agencyId },
      select: { id: true, agencyId: true },
    });

    if (!property) {
      throw new Error("Bien introuvable pour cet upload média.");
    }

    const stored = await saveUploadedFile({
      file,
      agencyId,
      bucket: "property-media",
      folder: propertyId,
    });

    return prisma.$transaction(async (tx) => {
      const lastSort = await tx.propertyMedia.aggregate({
        where: { propertyId },
        _max: { sortOrder: true },
      });

      const created = await propertyMediaRepository.create(tx, {
        agencyId,
        propertyId,
        fileUrl: stored.publicUrl,
        mediaType: "IMAGE",
        title: title?.trim() || null,
        sortOrder: (lastSort._max.sortOrder ?? 0) + 1,
        isCover: (lastSort._max.sortOrder ?? 0) === 0,
        isPublic: Boolean(isPublic),
        uploadedByUserId,
      });

      await tx.auditLog.create({
        data: {
          agencyId,
          userId: uploadedByUserId,
          actionType: "UPDATED",
          entityType: "PropertyMedia",
          entityId: created.id,
          metadataJson: {
            propertyId,
            fileUrl: created.fileUrl,
            isPublic: created.isPublic,
          },
        },
      });

      return created;
    });
  },
};
