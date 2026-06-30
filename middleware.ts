import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  const response = NextResponse.next();

  // Content Security Policy (CSP) - strict mode but allow necessary resources
  response.headers.set(
    "Content-Security-Policy",
    `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://api.openai.com https://*.firebaseio.com https://firestore.googleapis.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'`
  );

  // X-Frame-Options: Prevent clickjacking
  response.headers.set("X-Frame-Options", "SAMEORIGIN");

  // X-Content-Type-Options: Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Referrer-Policy: Control how much referrer info is sent
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy: Restrict sensitive APIs
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
