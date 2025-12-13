import { z } from 'zod';

/**
 * Environment Variables Schema
 * Validate environment variables at startup
 * Ensures all required variables are present and correctly typed
 */

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database
  DATABASE_URL: z.string().url('Invalid DATABASE_URL format'),
  
  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRE: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_REFRESH_EXPIRE: z.string().default('30d'),
  
  // Server Configuration
  API_PORT: z.string().default('3000'),
  API_HOST: z.string().default('localhost'),
  API_PREFIX: z.string().default('/api'),
  
  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
  // External Services (Optional)
  EXTERNAL_API_URL: z.string().url().optional(),
  
  // Feature Flags
  ENABLE_MONITORING: z.string().toLowerCase().transform(v => v === 'true').default('false'),
  ENABLE_EXTERNAL_AUTH: z.string().toLowerCase().transform(v => v === 'true').default('false'),
});

// Parse and validate environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsedEnv.error.errors);
  process.exit(1);
}

/**
 * Validated environment variables
 * Safe to use throughout the application
 */
export const env = parsedEnv.data;

/**
 * Type-safe environment variables export
 */
export type Env = z.infer<typeof envSchema>;
