import { env } from './env';

/**
 * Application Configuration
 * Centralized configuration for the entire application
 * Derived from environment variables and static values
 */

export const appConfig = {
  // Application Info
  app: {
    name: 'Quizzy',
    version: '1.0.0',
    description: 'Online Quiz Platform with 7 question types',
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },

  // Server Configuration
  server: {
    port: parseInt(env.API_PORT, 10),
    host: env.API_HOST,
    apiPrefix: env.API_PREFIX,
    nodeEnv: env.NODE_ENV,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  },

  // Database Configuration
  database: {
    url: env.DATABASE_URL,
    connectionOptions: {
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },

  // JWT Configuration
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRE,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRE,
  },

  // CORS Configuration
  cors: {
    origin: env.CORS_ORIGIN.split(',').map(o => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },

  // Logging Configuration
  logging: {
    level: env.LOG_LEVEL,
    format: 'json',
    enableConsole: env.NODE_ENV === 'development',
    enableFileLogging: env.NODE_ENV === 'production',
  },

  // Feature Flags
  features: {
    monitoring: env.ENABLE_MONITORING,
    externalAuth: env.ENABLE_EXTERNAL_AUTH,
  },

  // API Response Configuration
  api: {
    defaultPageSize: 10,
    maxPageSize: 100,
    timeoutMs: 30000,
  },

  // Authentication Configuration
  auth: {
    passwordMinLength: 6,
    passwordMaxLength: 128,
    usernameMinLength: 3,
    usernameMaxLength: 20,
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },

  // Quiz Configuration
  quiz: {
    maxQuestions: 500,
    minDuration: 1, // minutes
    maxDuration: 300, // minutes (5 hours)
    maxAttempts: 10,
  },

  // Pagination
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // requests per windowMs
    loginWindowMs: 15 * 60 * 1000,
    loginMaxRequests: 5,
  },
} as const;

export type AppConfig = typeof appConfig;
