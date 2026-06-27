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
  const now = Date.now();

  // ─── 1. CSRF Verification for State-Changing Requests ───
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    const referer = request.headers.get('referer');
    
    let isCsrfValid = true;
    if (origin) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          isCsrfValid = false;
        }
      } catch (e) {
        isCsrfValid = false;
      }
    } else if (referer) {
      try {
        const refererUrl = new URL(referer);
        if (refererUrl.host !== host) {
          isCsrfValid = false;
        }
      } catch (e) {
        isCsrfValid = false;
      }
    }

    if (!isCsrfValid) {
      return new NextResponse(
        JSON.stringify({ success: false, error: "CSRF verification failed" }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // ─── 2. 15-Minute Session Inactivity Lockout ───
  const token = request.cookies.get('df_auth_token')?.value;
  const lastActivity = request.cookies.get('df_last_activity')?.value;
  const isSignatureValid = token ? await verifyJwtSignature(token) : false;
  const decoded = (token && isSignatureValid) ? decodeJwt(token) : null;

  // Determine standard redirection path based on route type
  const getLoginRedirectPath = () => {
    if (pathname.startsWith('/portal/admin')) return '/portal/admin/login';
    if (pathname.startsWith('/portal/agent')) return '/portal/agent/login';
    return '/portal/customer/login';
  };

  if (decoded && lastActivity) {
    const elapsedMs = now - parseInt(lastActivity, 10);
    if (elapsedMs > 15 * 60 * 1000) {
      // Inactivity timeout triggered!
      const redirectPath = getLoginRedirectPath();
      const url = request.nextUrl.clone();
      url.pathname = redirectPath;
      const res = NextResponse.redirect(url);
      res.cookies.delete('df_auth_token');
      res.cookies.delete('df_last_activity');
      return res;
    }
  }

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

  // Proceed with response
  const response = NextResponse.next();

  // ─── 3. Session activity sliding window update ───
  if (decoded) {
    response.cookies.set('df_last_activity', now.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }

  // ─── 4. CORS & API Security Headers ───
  response.headers.set('Access-Control-Allow-Origin', request.nextUrl.origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // OWASP Recommended Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
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
