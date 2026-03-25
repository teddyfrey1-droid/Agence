import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { CONFIDENTIALITY_LEVELS, DOCUMENT_TYPES, type ConfidentialityLevelValue, type DocumentTypeValue } from "@/lib/client-options";
import { documentService } from "@/modules/documents/document.service";

export const runtime = "nodejs";

function isDocumentType(value: string): value is DocumentTypeValue {
  return (DOCUMENT_TYPES as readonly string[]).includes(value);
}

function isConfidentialityLevel(value: string): value is ConfidentialityLevelValue {
  return (CONFIDENTIALITY_LEVELS as readonly string[]).includes(value);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const rawDocumentType = String(formData.get("documentType") ?? "DOCUMENT_INTERNE");
  const rawVisibility = String(formData.get("visibility") ?? "INTERNAL");
  const documentType: DocumentTypeValue = isDocumentType(rawDocumentType) ? rawDocumentType : "DOCUMENT_INTERNE";
  const visibility: ConfidentialityLevelValue = isConfidentialityLevel(rawVisibility) ? rawVisibility : "INTERNAL";

  const propertyId = String(formData.get("propertyId") ?? "").trim() || undefined;
  const dealId = String(formData.get("dealId") ?? "").trim() || undefined;
  const fieldSpottingId = String(formData.get("fieldSpottingId") ?? "").trim() || undefined;
  const searchRequestId = String(formData.get("searchRequestId") ?? "").trim() || undefined;
  const contactId = String(formData.get("contactId") ?? "").trim() || undefined;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
  }

  try {
    const created = await documentService.uploadDocument({
      agencyId: user.agencyId,
      uploadedByUserId: user.id,
      file,
      documentType,
      visibility,
      propertyId,
      dealId,
      fieldSpottingId,
      searchRequestId,
      contactId,
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur upload document" },
      { status: 400 },
    );
  }
}
