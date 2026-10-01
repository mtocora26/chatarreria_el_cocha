import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/server/auth";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    const loginUrl = new URL("/ingresar", request.url);
    loginUrl.searchParams.set("continuar", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|icon.svg|icon-192.png|icon-512.png|apple-touch-icon.png|manifest.webmanifest|ingresar).*)",
  ],
};
