import { ConfidentialityLevel, DocumentType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { documentService } from "@/modules/documents/document.service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const documentType = String(formData.get("documentType") ?? DocumentType.DOCUMENT_INTERNE) as DocumentType;
  const visibility = String(formData.get("visibility") ?? ConfidentialityLevel.INTERNAL) as ConfidentialityLevel;

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
