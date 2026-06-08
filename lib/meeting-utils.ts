// Utilities for meeting platform identification and validation

export type MeetingPlatform = 'zoom' | 'google_meet' | 'microsoft_teams' | 'calendly' | 'other';

export function identifyMeetingPlatform(url: string): MeetingPlatform {
  const lowercaseUrl = url.toLowerCase();
  
  if (lowercaseUrl.includes('zoom.us')) {
    return 'zoom';
  }
  if (lowercaseUrl.includes('meet.google.com')) {
    return 'google_meet';
  }
  if (lowercaseUrl.includes('teams.microsoft.com') || lowercaseUrl.includes('teams.live.com')) {
    return 'microsoft_teams';
  }
  if (lowercaseUrl.includes('calendly.com')) {
    return 'calendly';
  }
  
  return 'other';
}

export function isValidGoogleMeetCode(code: string): boolean {
  const cleanCode = code.trim();
  const meetCodeRegex = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/;
  return meetCodeRegex.test(cleanCode);
}

export function isValidGoogleMeetUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname !== 'meet.google.com') {
      return false;
    }
    const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');
    return isValidGoogleMeetCode(path);
  } catch {
    return false;
  }
}

export function isValidCalendlyUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname !== 'calendly.com' && parsedUrl.hostname !== 'www.calendly.com') {
      return false;
    }
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    // A standard Calendly link should carry at least the username and event name (2 path parts)
    return pathParts.length >= 2;
  } catch {
    return false;
  }
}

export function isValidMeetingUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    // Basic protocol check
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return false;
    }
    // Basic domain check (should have at least one dot)
    if (!parsedUrl.hostname.includes('.')) {
      return false;
    }
    // Strict platform validation for Google Meet
    if (parsedUrl.hostname === 'meet.google.com') {
      const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');
      return isValidGoogleMeetCode(path);
    }
    // Strict platform validation for Calendly
    if (parsedUrl.hostname === 'calendly.com' || parsedUrl.hostname === 'www.calendly.com') {
      return isValidCalendlyUrl(url);
    }
    return true;
  } catch {
    return false;
  }
}
