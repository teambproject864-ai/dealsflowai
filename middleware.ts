import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

async function verifyJwtSignature(token: string): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // For local development and E2E tests, allow dummySignature bypass
    if (process.env.NODE_ENV !== 'production' && parts[2] === 'dummySignature') {
      return true;
    }

    const secret = process.env.JWT_SECRET || 'your-secret-key-in-production-env-var-only';
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const message = enc.encode(`${parts[0]}.${parts[1]}`);

    const base64Url = parts[2];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const sigString = atob(base64);
    const sigBytes = new Uint8Array(sigString.length);
    for (let i = 0; i < sigString.length; i++) {
      sigBytes[i] = sigString.charCodeAt(i);
    }

    return await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      message
    );
  } catch (e) {
    return false;
  }
}

function decodeJwt(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const decoded = atob(base64);
    const parsed = JSON.parse(decoded);

    // Verify token expiration
    const now = Math.floor(Date.now() / 1000);
    if (parsed.exp && parsed.exp < now) {
      return null;
    }
    return parsed;
  } catch (e) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('df_auth_token')?.value;
  const isSignatureValid = token ? await verifyJwtSignature(token) : false;
  const decoded = (token && isSignatureValid) ? decodeJwt(token) : null;

  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    return NextResponse.redirect(url);
  };

  // Rule A: /docs/gaps (admin only)
  if (pathname.startsWith('/docs/gaps')) {
    if (!decoded || decoded.role !== 'admin') {
      return redirectTo('/portal/admin/login');
    }
  }

  // Rule B: /rag (authenticated users only)
  if (pathname.startsWith('/rag')) {
    if (!decoded) {
      return redirectTo('/portal/customer/login');
    }
  }

  // Rule C: /portal/admin (admin only)
  if (pathname.startsWith('/portal/admin') && !pathname.startsWith('/portal/admin/login')) {
    if (!decoded || decoded.role !== 'admin') {
      return redirectTo('/portal/admin/login');
    }
  }

  // Rule E: /portal/agent (agent/admin only)
  if (pathname.startsWith('/portal/agent') && !pathname.startsWith('/portal/agent/login')) {
    if (!decoded || (decoded.role !== 'agent' && decoded.role !== 'admin')) {
      return redirectTo('/portal/agent/login');
    }
  }

  // Rule F: /portal/customer (customer/agent/admin only)
  if (pathname.startsWith('/portal/customer') && !pathname.startsWith('/portal/customer/login')) {
    if (!decoded || (decoded.role !== 'customer' && decoded.role !== 'agent' && decoded.role !== 'admin')) {
      return redirectTo('/portal/customer/login');
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/docs/gaps/:path*',
    '/rag/:path*',
    '/portal/admin/:path*',
    '/portal/agent/:path*',
    '/portal/customer/:path*',
  ],
};
