import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Solo revisa que exista la cookie: el proxy corre como edge function y no
// puede abrir la base de datos. Cada página valida la sesión con exigirSesion().
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
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
