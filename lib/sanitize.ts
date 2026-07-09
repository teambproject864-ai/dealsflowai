/**
 * Basic input sanitization to prevent XSS attacks.
 * Removes potentially dangerous HTML tags and attributes.
 */
export function sanitizeInput(input: string | undefined | null): string {
  if (!input) return '';
  // Convert to string first
  let sanitized = String(input);

  // Remove script tags and other potentially dangerous elements
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove dangerous attributes like onload, onclick, etc.
  sanitized = sanitized.replace(/\s(on\w+)\s*=/gi, ' data-disallowed-$1=');

  // Escape HTML characters to prevent XSS
  const escapeMap: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  sanitized = sanitized.replace(/[&<>"]/g, (char) => escapeMap[char]);

  return sanitized;
}

/**
 * Recursively sanitize all string values in an object or array
 */
export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  } else if (obj && typeof obj === 'object') {
    const sanitizedObj: { [key: string]: any } = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitizedObj[key] = sanitizeObject(value);
    }
    return sanitizedObj;
  }
  return obj;
}
