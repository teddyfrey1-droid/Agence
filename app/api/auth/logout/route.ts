import { NextResponse } from "next/server";

import { destroySession, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const user = await getCurrentUser();

  if (user) {
    await prisma.auditLog.create({
      data: {
        agencyId: user.agencyId,
        userId: user.id,
        actionType: "LOGOUT",
        entityType: "User",
        entityId: user.id,
      },
    });
  }

  await destroySession();

  return NextResponse.json({ success: true });
}
