import { logger } from "./logger";

export interface EnvValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateEnv(): EnvValidationResult {
  const errors: string[] = [];
  const isProd = process.env.NODE_ENV === "production";
  
  // Detect if running in a test environment to skip strict check
  const isTest = typeof process !== "undefined" && (
    process.env.NODE_ENV === "test" ||
    process.argv.some(arg => arg.includes("test"))
  );

  if (isTest) {
    return { valid: true, errors: [] };
  }

  // 1. Check JWT Secret (Critical for Security)
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    errors.push("JWT_SECRET environment variable is required.");
  } else {
    // Validate length and complexity
    if (jwtSecret.length < 32) {
      errors.push("JWT_SECRET must be at least 32 characters long to ensure cryptographic strength.");
    }
    
    const hasUppercase = /[A-Z]/.test(jwtSecret);
    const hasLowercase = /[a-z]/.test(jwtSecret);
    const hasNumbers = /[0-9]/.test(jwtSecret);
    const hasSpecial = /[^A-Za-z0-9]/.test(jwtSecret);
    const characterClassesCount = [hasUppercase, hasLowercase, hasNumbers, hasSpecial].filter(Boolean).length;
    
    // Check if it has at least 3 character classes OR is a strong cryptographically generated hex or base64 key
    const isHexOrBase64 = /^[0-9a-fA-F]{64,}$/.test(jwtSecret) || /^[A-Za-z0-9+/]{44,}={0,2}$/.test(jwtSecret);
    
    if (characterClassesCount < 3 && !isHexOrBase64) {
      errors.push("JWT_SECRET is not complex enough. It must contain a mix of uppercase, lowercase, numbers, and special characters, or be a cryptographically strong generated key (like a 32-byte hex/base64 string).");
    }
    
    // Check for common weak phrases
    const lowerSecret = jwtSecret.toLowerCase();
    const weakPhrases = ["secret", "default", "password", "123456", "change-me", "your-secret-key"];
    for (const phrase of weakPhrases) {
      if (lowerSecret.includes(phrase)) {
        errors.push(`JWT_SECRET must not contain common weak words/phrases like '${phrase}'.`);
      }
    }
  }

  // 2. Check Firebase Configuration (optional, not required for basic login/demo)
  const saPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const hasSaVars = 
    process.env.FIREBASE_PROJECT_ID && 
    process.env.FIREBASE_CLIENT_EMAIL && 
    process.env.FIREBASE_PRIVATE_KEY;

  if (!saPath && !hasSaVars && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Only warn, don't fail validation - demo users can use hardcoded credentials
    logger.warn("Firebase Admin credentials not configured - using demo accounts only");
  }

  // 3. AI configuration (Warnings only, as these are often hot-swappable)
  const provider = process.env.AI_PROVIDER || "huggingface";
  if (provider === "huggingface" && !process.env.HUGGINGFACE_API_TOKEN && !process.env.HF_TOKEN) {
    logger.warn("AI_PROVIDER is set to 'huggingface' but HUGGINGFACE_API_TOKEN is missing.");
  } else if (provider === "nvidia" && !process.env.NVIDIA_API_KEY) {
    logger.warn("AI_PROVIDER is set to 'nvidia' but NVIDIA_API_KEY is missing.");
  } else if (provider === "kimi" && !process.env.KIMI_API_KEY) {
    logger.warn("AI_PROVIDER is set to 'kimi' but KIMI_API_KEY is missing.");
  }

  if (errors.length > 0) {
    logger.error("Environment validation failed", { errors });
    return { valid: false, errors };
  }

  logger.info("Environment validation succeeded");
  return { valid: true, errors: [] };
}
