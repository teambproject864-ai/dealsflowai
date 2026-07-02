// lib/security-firewall.ts
import { NextResponse } from 'next/server';
import { getClawpatrol, SecurityEventType, SecuritySeverity } from './clawpatrol';
import { checkRateLimit } from './rate-limiter';
import { requireAuth, UserRole } from './auth';
import { createHash } from 'crypto';

// IP Blacklist (Simulating firewall rules)
const BLOCKED_IPS = new Set<string>(
  (process.env.BLOCKED_IPS || '198.51.100.42,203.0.113.15').split(',').map(ip => ip.trim())
);

// Whitelisted internal IPs/service accounts
const INTERNAL_IPS = new Set<string>(
  (process.env.INTERNAL_IPS || '127.0.0.1,::1,localhost').split(',').map(ip => ip.trim())
);

export class IpFirewall {
  /**
   * Checks if an IP is authorized
   */
  static isIpBlocked(ip: string): boolean {
    if (BLOCKED_IPS.has(ip)) {
      return true;
    }
    return false;
  }

  /**
   * Hashes IP address for GDPR-compliant audit logging
   */
  static hashIp(ip: string): string {
    return createHash('sha256').update(ip + (process.env.IP_HASH_SALT || 'dealflow-salt-987')).digest('hex');
  }
}

export class WafFirewall {
  private static suspiciousPatterns = [
    // SQLi patterns
    { regex: /UNION\s+(ALL\s+)?SELECT/i, type: 'SQLI' as const, desc: 'SQL UNION Select attempt' },
    { regex: /OR\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?/i, type: 'SQLI' as const, desc: 'SQL tautology attempt' },
    { regex: /SELECT\s+.*\s+FROM\s+/i, type: 'SQLI' as const, desc: 'SQL SELECT query attempt' },
    { regex: /INSERT\s+INTO\s+/i, type: 'SQLI' as const, desc: 'SQL INSERT statement attempt' },
    { regex: /UPDATE\s+.*\s+SET\s+/i, type: 'SQLI' as const, desc: 'SQL UPDATE statement attempt' },
    { regex: /DELETE\s+FROM\s+/i, type: 'SQLI' as const, desc: 'SQL DELETE statement attempt' },
    { regex: /DROP\s+TABLE/i, type: 'SQLI' as const, desc: 'SQL DROP TABLE attempt' },
    { regex: /--/i, type: 'SQLI' as const, desc: 'SQL Comment sequence' },

    // XSS patterns
    { regex: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i, type: 'XSS' as const, desc: 'Script tag injection' },
    { regex: /javascript:/i, type: 'XSS' as const, desc: 'Javascript URI scheme injection' },
    { regex: /\s(on\w+)\s*=/i, type: 'XSS' as const, desc: 'Inline event handler injection' },
    { regex: /<iframe\b[^<]*>/i, type: 'XSS' as const, desc: 'Iframe injection' },
    { regex: /data:text\/html/i, type: 'XSS' as const, desc: 'Data URI HTML injection' },

    // Path Traversal patterns
    { regex: /\.\.[\\/\\]/g, type: 'PATH_TRAVERSAL' as const, desc: 'Relative path traversal (../)' },
    { regex: /(\/etc\/passwd|win\.ini|system\.ini|etc[\\/]hosts|system32)/i, type: 'PATH_TRAVERSAL' as const, desc: 'System configuration file access' },

    // OS Command Injection
    { regex: /(;|\&\&|\|\||\|)\s*(rm\s+-rf|dir|ls|ping|cat|exec|sh\b|bash\b|cmd\b|powershell\b)/i, type: 'CMD_INJECTION' as const, desc: 'OS Command chaining attempt' }
  ];

  /**
   * Scans a string input for common WAF attacks
   */
  static scanString(input: string): { isMalicious: boolean; description?: string; type?: string } {
    if (!input) return { isMalicious: false };
    
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.regex.test(input)) {
        return { isMalicious: true, description: pattern.desc, type: pattern.type };
      }
    }
    
    return { isMalicious: false };
  }

  /**
   * Scans objects recursively for vulnerabilities
   */
  static scanObject(obj: any): { isMalicious: boolean; description?: string; type?: string } {
    if (!obj) return { isMalicious: false };

    if (typeof obj === 'string') {
      return this.scanString(obj);
    }

    if (Array.isArray(obj)) {
      for (const item of obj) {
        const check = this.scanObject(item);
        if (check.isMalicious) return check;
      }
    } else if (typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        // Also scan keys for injection attempts
        const keyCheck = this.scanString(key);
        if (keyCheck.isMalicious) return keyCheck;

        const valueCheck = this.scanObject(value);
        if (valueCheck.isMalicious) return valueCheck;
      }
    }

    return { isMalicious: false };
  }

  /**
   * Evaluates SSRF risk in a URL parameter
   */
  static isSsrfThreat(urlStr: string): boolean {
    try {
      if (!urlStr) return false;
      
      // Basic check for protocols
      if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
        return false;
      }

      const parsedUrl = new URL(urlStr);
      const host = parsedUrl.hostname.toLowerCase();

      // Check local/private IPs and localhosts
      const privateRanges = [
        /^localhost$/i,
        /^127\.\d+\.\d+\.\d+$/i,
        /^10\.\d+\.\d+\.\d+$/i,
        /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/i,
        /^192\.168\.\d+\.\d+$/i,
        /^169\.254\.169\.254$/i, // Link-local (AWS/GCP metadata)
        /^::1$/i,
        /^0\.0\.0\.0$/i
      ];

      for (const rx of privateRanges) {
        if (rx.test(host)) {
          return true;
        }
      }

      // Check URL path for metadata endpoints
      if (parsedUrl.pathname.includes('/latest/meta-data') || parsedUrl.pathname.includes('/computeMetadata')) {
        return true;
      }

      return false;
    } catch {
      return true; // If URL fails parsing, block it as a precaution
    }
  }
}

export class DlpScanner {
  private static piiPatterns = [
    { regex: /\b\d{3}-\d{2}-\d{4}\b/g, desc: 'SSN' },
    { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, desc: 'Email' },
    { regex: /\b(?:\+?\d{1,3}[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}\b/g, desc: 'Phone' },
    { regex: /\b\d{4}[-. ]?\d{4}[-. ]?\d{4}[-. ]?\d{4}\b/g, desc: 'CreditCard' },
    { regex: /-----BEGIN\s+PRIVATE\s+KEY-----[\s\S]*?-----END\s+PRIVATE\s+KEY-----/g, desc: 'PrivateKey' }
  ];

  /**
   * Recursively scans and redacts PII in responses
   */
  static redactPII(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'string') {
      let redacted = data;
      for (const pattern of this.piiPatterns) {
        redacted = redacted.replace(pattern.regex, `[REDACTED_${pattern.desc.toUpperCase()}]`);
      }
      return redacted;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.redactPII(item));
    }

    if (typeof data === 'object') {
      const result: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        // Exempt authorization/hashed headers/keys that require their formats
        if (['id', 'hashedPassword', 'password', 'createdAt', 'updatedAt', 'token'].includes(key)) {
          result[key] = value;
        } else {
          result[key] = this.redactPII(value);
        }
      }
      return result;
    }

    return data;
  }
}

export interface SecurityOptions {
  allowedRoles?: UserRole[];
  skipWaf?: boolean;
  skipDlp?: boolean;
  skipRateLimit?: boolean;
}

/**
 * RASP decorator / high-order wrapper for API route handlers.
 * Intercepts requests, validates inputs against WAF, checks rate limits/RBAC, 
 * executes handler, and validates outputs against DLP leakage.
 */
export function withSecurityFirewall(
  handler: (req: Request, context?: any) => Promise<Response>,
  options: SecurityOptions = {}
) {
  return async (req: Request, context?: any): Promise<Response> => {
    const startTime = Date.now();
    const clawpatrol = getClawpatrol();
    
    // 1. IP Firewall Check
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    if (IpFirewall.isIpBlocked(ip)) {
      clawpatrol.inspectInbound('system-waf', `Blocked IP access attempt: ${ip}`, { ip });
      clawpatrol.getAuditLogs(); // ensure initialized
      return NextResponse.json(
        { success: false, error: 'Access Denied: IP address blacklisted by Firewall' },
        { status: 403 }
      );
    }

    // 2. Rate Limiter Guardrail
    if (!options.skipRateLimit) {
      const rateLimitRes = await checkRateLimit(req);
      if (!rateLimitRes.allowed) {
        const msBeforeNext = rateLimitRes.msBeforeNext || 1000;
        const headers = new Headers();
        headers.set('Retry-After', Math.ceil(msBeforeNext / 1000).toString());
        headers.set('X-Firewall-Blocked', 'true');
        
        clawpatrol.inspectInbound('system-rate-limiter', `Rate limit exceeded for IP: ${ip}`, { ip });
        return NextResponse.json(
          { success: false, error: 'Too many requests, please try again later' },
          { status: 429, headers }
        );
      }
    }

    // 3. Authorization & Least-Privilege Role Check
    let authUser: any = null;
    if (options.allowedRoles && options.allowedRoles.length > 0) {
      const { user, errorResponse } = await requireAuth(req, options.allowedRoles);
      if (errorResponse) {
        clawpatrol.inspectInbound('system-auth', `Auth failed for IP: ${ip} targeting route`, { ip });
        return errorResponse;
      }
      authUser = user;
    }

    // 4. WAF Input Scanning (Body, Query params, Headers)
    if (!options.skipWaf) {
      // Scan URL Query parameters
      const url = new URL(req.url);
      const queryParams = Object.fromEntries(url.searchParams.entries());
      const queryCheck = WafFirewall.scanObject(queryParams);
      if (queryCheck.isMalicious) {
        clawpatrol.inspectInbound('system-waf', `Query param injection detected: ${queryCheck.description}`, { ip, queryParams });
        return NextResponse.json(
          { success: false, error: `Access Denied: Malicious query syntax detected (${queryCheck.description})` },
          { status: 403 }
        );
      }

      // Check SSRF parameters
      const urlParam = url.searchParams.get('url') || url.searchParams.get('target') || url.searchParams.get('webhookUrl');
      if (urlParam && WafFirewall.isSsrfThreat(urlParam)) {
        clawpatrol.inspectInbound('system-waf', `SSRF threat blocked: ${urlParam}`, { ip, urlParam });
        return NextResponse.json(
          { success: false, error: 'Access Denied: SSRF payload threat detected on destination host' },
          { status: 403 }
        );
      }

      // Scan Request Body (cloned to keep downstream stream open)
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        try {
          const reqClone = req.clone();
          const contentType = req.headers.get('content-type') || '';
          
          if (contentType.includes('application/json')) {
            const body = await reqClone.json();
            const bodyCheck = WafFirewall.scanObject(body);
            if (bodyCheck.isMalicious) {
              clawpatrol.inspectInbound('system-waf', `JSON body injection detected: ${bodyCheck.description}`, { ip, body });
              return NextResponse.json(
                { success: false, error: `Access Denied: Malicious body payload detected (${bodyCheck.description})` },
                { status: 403 }
              );
            }
          } else if (contentType.includes('application/x-www-form-urlencoded')) {
            const bodyText = await reqClone.text();
            const params = Object.fromEntries(new URLSearchParams(bodyText).entries());
            const bodyCheck = WafFirewall.scanObject(params);
            if (bodyCheck.isMalicious) {
              clawpatrol.inspectInbound('system-waf', `Form body injection detected: ${bodyCheck.description}`, { ip, params });
              return NextResponse.json(
                { success: false, error: `Access Denied: Malicious body payload detected (${bodyCheck.description})` },
                { status: 403 }
              );
            }
          }
        } catch (e) {
          // If body parsing fails, let the original handler throw or handle it
        }
      }
    }

    // 5. Invoke downstream handler
    let response: Response;
    try {
      response = await handler(req, context);
    } catch (error) {
      console.error('[WAF Firewall Handler Error]:', error);
      return NextResponse.json(
        { success: false, error: 'Internal Server Error' },
        { status: 500 }
      );
    }

    // 6. DLP Output Sanitization & Security Headers
    const latency = Date.now() - startTime;
    const finalHeaders = new Headers(response.headers);
    finalHeaders.set('X-Firewall-Latency', `${latency}ms`);
    finalHeaders.set('X-Frame-Options', 'SAMEORIGIN');
    finalHeaders.set('X-Content-Type-Options', 'nosniff');

    if (!options.skipDlp && response.ok) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          const responseClone = response.clone();
          const jsonBody = await responseClone.json();

          // Only skip DLP redaction if user is authenticated and is an 'admin'
          if (!authUser || authUser.role !== 'admin') {
            const sanitized = DlpScanner.redactPII(jsonBody);
            
            // Re-create the Response with sanitized content
            const blob = new Blob([JSON.stringify(sanitized)], { type: 'application/json' });
            return new Response(blob, {
              status: response.status,
              statusText: response.statusText,
              headers: finalHeaders,
            });
          }
        } catch (e) {
          // If response parsing fails, fallback to standard response
        }
      }
    }

    // Re-create original response with extra headers if not sanitized
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: finalHeaders,
    });
  };
}
