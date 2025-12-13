/**
 * ERROR HANDLING & MIDDLEWARE GUIDE - Phase 7
 * 
 * This guide explains how to use the error handling and middleware system
 * in the Quizzy application.
 */

// ============================================================================
// 1. GLOBAL ERROR HANDLER
// ============================================================================

/**
 * The GlobalErrorHandler automatically catches and handles all errors:
 * - Domain Errors (ValidationError, NotFoundError, etc.)
 * - Zod validation errors
 * - Mongoose/MongoDB errors
 * - JWT/token errors
 * - Generic server errors
 * 
 * Example usage in API routes:
 */

import { NextRequest } from 'next/server';
import { createApiHandler } from '@/lib/middleware-chain';
import { sendSuccess, sendError } from '@/lib/api-response';

// Option 1: Using createApiHandler wrapper
export const GET = createApiHandler(async (request: NextRequest) => {
  // Your route logic here - errors are caught automatically
  return sendSuccess({ data: 'example' });
});

// Option 2: Using GlobalErrorHandler.handle()
import { GlobalErrorHandler } from '@/lib/error-handler';

export async function POST(request: NextRequest) {
  try {
    // Route logic
    return sendSuccess({ data: 'example' });
  } catch (error) {
    return GlobalErrorHandler.handle(error);
  }
}

// ============================================================================
// 2. INPUT VALIDATION
// ============================================================================

/**
 * Validate user input using Zod schemas and safe validation
 */

import { validateInput, validateBatch } from '@/lib/validation-helper';
import { loginSchema } from '@/core/shared/validation/schemas';

// Simple validation
const { success, data, errors } = validateInput(loginSchema, {
  email: 'user@example.com',
  password: 'password123',
});

if (!success) {
  // errors.email, errors.password
  return sendValidationError('Validation failed', errors);
}

// ============================================================================
// 3. INPUT SANITIZATION
// ============================================================================

/**
 * Sanitize and clean user input
 */

import { InputSanitizer, extractQueryParams } from '@/lib/input-sanitizer';

// Sanitize strings
const cleanName = InputSanitizer.sanitizeString('<script>alert("xss")</script>');
// Result: 'scriptalert("xss")script' (tags removed)

// Sanitize emails
const cleanEmail = InputSanitizer.sanitizeEmail('user@example.com');

// Sanitize objects
const cleanObject = InputSanitizer.sanitizeObject({
  name: '<b>John</b>',
  age: 30,
  tags: ['tag1', 'tag2'],
});

// Extract and sanitize query params
const params = extractQueryParams(request);

// ============================================================================
// 4. AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Protect routes with authentication
 */

import { withAuth, withRole, withOptionalAuth } from '@/lib/auth-middleware';

// Required authentication
export async function DELETE(request: NextRequest) {
  return withAuth(request, async (req, auth) => {
    // auth.userId, auth.email, auth.role are available
    return sendSuccess({ message: 'Deleted' });
  });
}

// Required authentication with specific role
export async function PATCH(request: NextRequest) {
  return withRole(request, 'admin', async (req, auth) => {
    // Only admins can access
    return sendSuccess({ message: 'Updated' });
  });
}

// Multiple roles allowed
export async function UPDATE(request: NextRequest) {
  return withRole(request, ['admin', 'teacher'], async (req, auth) => {
    // Admins and teachers can access
    return sendSuccess({ message: 'Updated' });
  });
}

// Optional authentication (user may or may not be logged in)
export async function BROWSE(request: NextRequest) {
  return withOptionalAuth(request, async (req, auth) => {
    if (auth) {
      // User is logged in
      console.log('Logged in user:', auth.userId);
    } else {
      // User is not logged in
      console.log('Anonymous access');
    }
    return sendSuccess({ message: 'Browse allowed' });
  });
}

// ============================================================================
// 5. MIDDLEWARE CHAIN
// ============================================================================

/**
 * Create custom middleware chains
 */

import { MiddlewareChain } from '@/lib/middleware-chain';

const chain = new MiddlewareChain();

chain
  .use(async (req, next) => {
    // First middleware - add custom header
    console.log('Middleware 1');
    return next(req);
  })
  .use(async (req, next) => {
    // Second middleware - track time
    const start = Date.now();
    const res = await next(req);
    console.log(`Duration: ${Date.now() - start}ms`);
    return res;
  });

// Execute chain
await chain.execute(request, async (req) => {
  return sendSuccess({ data: 'example' });
});

// ============================================================================
// 6. LOGGING
// ============================================================================

/**
 * Logging for debugging and monitoring
 */

import { logger } from '@/lib/logger/logger';

logger.info('User logged in', { userId: '123' });
logger.error('Database connection failed', error);
logger.warn('High memory usage detected', { memory: '80%' });
logger.debug('Query executed', { query: 'SELECT * FROM users' });

// Request logging is automatic with createApiHandler

// ============================================================================
// 7. ERROR BOUNDARY (React)
// ============================================================================

/**
 * Catch errors in React components
 */

import { ErrorBoundary, withErrorBoundary } from '@/app/components/common/ErrorBoundary';

// Option 1: Wrap components directly
function MyPage() {
  return (
    <ErrorBoundary>
      <SomeComponent />
    </ErrorBoundary>
  );
}

// Option 2: Use HOC
const SafeComponent = withErrorBoundary(MyComponent, <CustomFallback />);

// ============================================================================
// 8. SERVICE ERROR HANDLING
// ============================================================================

/**
 * Handle errors in service layer
 */

import { ServiceErrorHandler, withErrorHandling, retryWithBackoff } from '@/lib/service-error-handler';

// Handle and log error
try {
  await someOperation();
} catch (error) {
  ServiceErrorHandler.handle(error, 'UserService.createUser', {
    email: userData.email,
  });
}

// Throw error with context
try {
  await databaseOperation();
} catch (error) {
  ServiceErrorHandler.throwWithContext(
    error,
    'UserService.getUser',
    'Failed to fetch user from database'
  );
}

// Async wrapper with error handling
const result = await withErrorHandling(
  async () => {
    return await userRepository.findById(id);
  },
  'UserService.getById'
);

// Retry with exponential backoff
const data = await retryWithBackoff(
  async () => {
    return await externalAPI.fetch();
  },
  3, // max retries
  1000 // base delay in ms
);

// ============================================================================
// 9. DOMAIN ERRORS
// ============================================================================

/**
 * Use domain-specific errors for clear error handling
 */

import { NotFoundError } from '@/core/shared/errors/not-found-error';
import { ValidationError } from '@/core/shared/errors/validation-error';
import { ConflictError } from '@/core/shared/errors/conflict-error';

// In services
if (!user) {
  throw new NotFoundError('User not found');
}

if (!isValidEmail(email)) {
  throw new ValidationError('Invalid email format');
}

if (emailExists) {
  throw new ConflictError('Email already registered');
}

// All domain errors are automatically caught and handled by GlobalErrorHandler
// and converted to appropriate HTTP responses

// ============================================================================
// 10. COMPLETE EXAMPLE
// ============================================================================

/**
 * A complete example combining all error handling
 */

export async function POST(request: NextRequest) {
  // Use middleware chain with error handler
  return createApiHandler(async (req) => {
    // 1. Require authentication
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return sendUnauthorized('Token required');
    }

    // 2. Parse and validate request body
    const body = await req.json();
    const { success, data, errors } = validateInput(userCreateSchema, body);

    if (!success) {
      return sendValidationError('Invalid input', errors);
    }

    // 3. Sanitize input
    const sanitized = InputSanitizer.sanitizeObject(data);

    // 4. Call service (errors automatically caught)
    const service = new UserService(userRepository);
    const user = await service.createUser(sanitized);

    // 5. Return response
    return sendSuccess(user, 'User created', 201);
  })(request);
}
