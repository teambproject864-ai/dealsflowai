import { SecurityEventType, SecuritySeverity } from './types';

export class PromptInjectionDetector {
  private suspiciousPatterns: RegExp[];

  constructor() {
    this.suspiciousPatterns = [
      /ignore previous instructions/i,
      /disregard prior commands/i,
      /you are now/i,
      /system prompt/i,
      /act as/i,
      /pretend to be/i,
      /output your/i,
      /show your/i,
      /reveal your/i,
      /bypass security/i,
      /override restrictions/i,
      /{{.*?}}/g,
      /\[\[.*?\]\]/g,
      /\$\{.*?\}/g,
      /eval\s*\(/i,
      /import\s*\(/i,
      /require\s*\(/i,
    ];
  }

  detect(prompt: string): {
    isSuspicious: boolean;
    severity: SecuritySeverity;
    matchedPatterns: string[];
  } {
    const matchedPatterns: string[] = [];

    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(prompt)) {
        matchedPatterns.push(pattern.toString());
      }
    }

    const severity = this.calculateSeverity(matchedPatterns.length, prompt.length);

    return {
      isSuspicious: matchedPatterns.length > 0,
      severity,
      matchedPatterns,
    };
  }

  private calculateSeverity(matchCount: number, promptLength: number): SecuritySeverity {
    if (matchCount === 0) return SecuritySeverity.LOW;
    
    const ratio = matchCount / (promptLength / 100);
    
    if (ratio > 0.2 || matchCount > 3) {
      return SecuritySeverity.CRITICAL;
    } else if (ratio > 0.1 || matchCount > 1) {
      return SecuritySeverity.HIGH;
    } else {
      return SecuritySeverity.MEDIUM;
    }
  }
}
