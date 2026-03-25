import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      database: "up",
      storageDriver: process.env.STORAGE_DRIVER ?? "local",
      mapboxConfigured: Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN),
      sessionSecretConfigured: Boolean(process.env.SESSION_SECRET ?? process.env.NEXTAUTH_SECRET),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        timestamp: new Date().toISOString(),
        database: "down",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
