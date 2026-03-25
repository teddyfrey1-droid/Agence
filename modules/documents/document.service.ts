import { prisma } from "@/lib/prisma";
import { assertAllowedDocument, saveUploadedFile } from "@/lib/uploads";
import type { ConfidentialityLevelValue, DocumentTypeValue } from "@/lib/client-options";
import { documentRepository } from "./document.repository";

async function ensureEntityBelongsToAgency(params: {
  agencyId: string;
  propertyId?: string;
  dealId?: string;
  fieldSpottingId?: string;
  searchRequestId?: string;
  contactId?: string;
}) {
  const { agencyId, propertyId, dealId, fieldSpottingId, searchRequestId, contactId } = params;

  if (propertyId) {
    const property = await prisma.property.findFirst({ where: { id: propertyId, agencyId }, select: { id: true } });
    if (!property) throw new Error("Bien introuvable pour ce document.");
  }

  if (dealId) {
    const deal = await prisma.deal.findFirst({ where: { id: dealId, agencyId }, select: { id: true } });
    if (!deal) throw new Error("Dossier introuvable pour ce document.");
  }

  if (fieldSpottingId) {
    const spotting = await prisma.fieldSpotting.findFirst({ where: { id: fieldSpottingId, agencyId }, select: { id: true } });
    if (!spotting) throw new Error("Repérage introuvable pour ce document.");
  }

  if (searchRequestId) {
    const request = await prisma.searchRequest.findFirst({ where: { id: searchRequestId, agencyId }, select: { id: true } });
    if (!request) throw new Error("Demande introuvable pour ce document.");
  }

  if (contactId) {
    const contact = await prisma.contact.findFirst({ where: { id: contactId, agencyId }, select: { id: true } });
    if (!contact) throw new Error("Contact introuvable pour ce document.");
  }
}

export const documentService = {
  async uploadDocument(params: {
    agencyId: string;
    uploadedByUserId: string;
    file: File;
    documentType?: DocumentTypeValue;
    visibility?: ConfidentialityLevelValue;
    propertyId?: string;
    dealId?: string;
    fieldSpottingId?: string;
    searchRequestId?: string;
    contactId?: string;
  }) {
    const {
      agencyId,
      uploadedByUserId,
      file,
      documentType = "DOCUMENT_INTERNE",
      visibility = "INTERNAL",
      propertyId,
      dealId,
      fieldSpottingId,
      searchRequestId,
      contactId,
    } = params;

    if (!propertyId && !dealId && !fieldSpottingId && !searchRequestId && !contactId) {
      throw new Error("Aucune cible de document renseignée.");
    }

    assertAllowedDocument(file);

    await ensureEntityBelongsToAgency({
      agencyId,
      propertyId,
      dealId,
      fieldSpottingId,
      searchRequestId,
      contactId,
    });

    const bucketFolder = propertyId ?? dealId ?? fieldSpottingId ?? searchRequestId ?? contactId ?? "general";
    const stored = await saveUploadedFile({
      file,
      agencyId,
      bucket: "documents",
      folder: bucketFolder,
    });

    return prisma.$transaction(async (tx) => {
      const created = await documentRepository.create(tx, {
        agencyId,
        documentType,
        fileUrl: stored.publicUrl,
        fileName: stored.fileName,
        mimeType: stored.mimeType,
        visibility,
        uploadedByUserId,
        propertyId: propertyId ?? null,
        dealId: dealId ?? null,
        fieldSpottingId: fieldSpottingId ?? null,
        searchRequestId: searchRequestId ?? null,
        contactId: contactId ?? null,
      });

      await tx.auditLog.create({
        data: {
          agencyId,
          userId: uploadedByUserId,
          actionType: "UPDATED",
          entityType: "Document",
          entityId: created.id,
          metadataJson: {
            propertyId,
            dealId,
            fieldSpottingId,
            searchRequestId,
            contactId,
            documentType,
          },
        },
      });

      return created;
    });
  },
};
