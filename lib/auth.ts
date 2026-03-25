import { createHmac, timingSafeEqual } from "node:crypto";

import { RoleCode, UserStatus } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "premium_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export type CurrentUser = {
  id: string;
  agencyId: string;
  fullName: string;
  email: string;
  role: RoleCode;
};

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET ?? process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET ou NEXTAUTH_SECRET manquant");
  }

  return secret;
}

function signValue(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function buildSessionValue(userId: string) {
  return `${userId}.${signValue(userId)}`;
}

function verifySessionValue(rawValue: string | undefined) {
  if (!rawValue) return null;

  const [userId, signature] = rawValue.split(".");
  if (!userId || !signature) return null;

  const expected = signValue(userId);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (signatureBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  return userId;
}

export async function createSession(userId: string) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, buildSessionValue(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const rawSessionValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const userId = verifySessionValue(rawSessionValue);

  if (!userId) return null;

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      status: UserStatus.ACTIVE,
    },
    include: { role: true },
  });

  if (!user) return null;

  return {
    id: user.id,
    agencyId: user.agencyId,
    fullName: user.fullName,
    email: user.email,
    role: user.role.code,
  };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
