import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
const SESSION_COOKIE_NAME = "premium_session";
export function middleware(request: NextRequest) { const session = request.cookies.get(SESSION_COOKIE_NAME)?.value; const { pathname } = request.nextUrl; if (pathname.startsWith("/app") && !session) return NextResponse.redirect(new URL("/login", request.url)); if (pathname.startsWith("/login") && session) return NextResponse.redirect(new URL("/app/accueil", request.url)); return NextResponse.next(); }
export const config = { matcher: ["/app/:path*", "/login"] };
