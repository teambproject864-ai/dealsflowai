/** @type {import('next').NextConfig} */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- Safeguard: Prevent startup if required environment variables like JWT_SECRET are missing or weak in production ---
if (process.env.NODE_ENV === "production") {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error("\n=======================================================================");
    console.error("FATAL ERROR: JWT_SECRET environment variable is missing in production!");
    console.error("Application startup aborted.");
    console.error("=======================================================================\n");
    process.exit(1);
  }
  
  if (jwtSecret.length < 32) {
    console.error("\n=======================================================================");
    console.error("FATAL ERROR: JWT_SECRET must be at least 32 characters long in production!");
    console.error("Application startup aborted.");
    console.error("=======================================================================\n");
    process.exit(1);
  }
  
  const hasUppercase = /[A-Z]/.test(jwtSecret);
  const hasLowercase = /[a-z]/.test(jwtSecret);
  const hasNumbers = /[0-9]/.test(jwtSecret);
  const hasSpecial = /[^A-Za-z0-9]/.test(jwtSecret);
  const characterClassesCount = [hasUppercase, hasLowercase, hasNumbers, hasSpecial].filter(Boolean).length;
  const isHexOrBase64 = /^[0-9a-fA-F]{64,}$/.test(jwtSecret) || /^[A-Za-z0-9+/]{44,}={0,2}$/.test(jwtSecret);
  
  if (characterClassesCount < 3 && !isHexOrBase64) {
    console.error("\n=======================================================================");
    console.error("FATAL ERROR: JWT_SECRET is not complex enough for production environments!");
    console.error("Application startup aborted.");
    console.error("=======================================================================\n");
    process.exit(1);
  }
  
  const lowerSecret = jwtSecret.toLowerCase();
  const weakPhrases = ["secret", "default", "password", "123456", "change-me", "your-secret-key"];
  for (const phrase of weakPhrases) {
    if (lowerSecret.includes(phrase)) {
      console.error(`\n=======================================================================`);
      console.error(`FATAL ERROR: JWT_SECRET contains weak phrase '${phrase}'!`);
      console.error("Application startup aborted.");
      console.error(`=======================================================================\n`);
      process.exit(1);
    }
  }
}

const nextConfig = {
  // Streaming chat + intro effect behave more predictably without double-invoke in dev.
  reactStrictMode: false,
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {

    return [
      {
        source: '/exit',
        destination: 'https://dealsflowai.vercel.app/',
        permanent: true,
      },
    ];
  },
  async headers() {
    if (process.env.NODE_ENV === 'development') {
      return [];
    }
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://app.cal.com https://cal.com https://assets.calendly.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: https://assets.calendly.com; font-src 'self' data:; connect-src 'self' https://dealflow-ai-651cb.firebaseio.com https://*.firebaseio.com wss://*.firebaseio.com https://dealflow-ai-651cb.appspot.com https://*.googleapis.com https://api.huggingface.co https://calendly.com; frame-src https://app.cal.com https://cal.com https://calendly.com; worker-src 'self' blob:; child-src 'self' blob:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
