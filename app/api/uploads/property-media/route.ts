import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { propertyMediaService } from "@/modules/property-media/property-media.service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const formData = await request.formData();
  const propertyId = String(formData.get("propertyId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const isPublic = String(formData.get("isPublic") ?? "false") === "true";
  const file = formData.get("file");

  if (!propertyId) {
    return NextResponse.json({ error: "propertyId requis" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier image requis" }, { status: 400 });
  }

  try {
    const created = await propertyMediaService.uploadPropertyMedia({
      agencyId: user.agencyId,
      uploadedByUserId: user.id,
      propertyId,
      file,
      title,
      isPublic,
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur upload média" },
      { status: 400 },
    );
  }
}
