/**
 * Error Messages
 * User-friendly error messages corresponding to error codes
 */

export const ERROR_MESSAGES = {
  // Authentication & Authorization
  AUTH_INVALID_CREDENTIALS: 'Invalid email or password',
  AUTH_INVALID_TOKEN: 'Invalid or malformed token',
  AUTH_TOKEN_EXPIRED: 'Token has expired',
  AUTH_UNAUTHORIZED: 'Unauthorized access',
  AUTH_FORBIDDEN: 'Forbidden access',
  AUTH_USER_NOT_FOUND: 'User not found',
  AUTH_USER_INACTIVE: 'User account is inactive',
  AUTH_PASSWORD_WEAK: 'Password does not meet security requirements',

  // User
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User already exists',
  USER_EMAIL_TAKEN: 'Email address is already in use',
  USER_USERNAME_TAKEN: 'Username is already taken',
  USER_UPDATE_FAILED: 'Failed to update user',

  // Category
  CATEGORY_NOT_FOUND: 'Category not found',
  CATEGORY_ALREADY_EXISTS: 'Category already exists',
  CATEGORY_INVALID: 'Invalid category data',

  // Quiz
  QUIZ_NOT_FOUND: 'Quiz not found',
  QUIZ_NOT_ACTIVE: 'Quiz is not active',
  QUIZ_MAX_ATTEMPTS_REACHED: 'Maximum attempts reached for this quiz',
  QUIZ_INVALID: 'Invalid quiz data',
  QUIZ_INVALID_DURATION: 'Invalid quiz duration',
  QUIZ_QUESTIONS_MISSING: 'Quiz has no questions',

  // Questions
  QUESTION_NOT_FOUND: 'Question not found',
  QUESTION_INVALID_TYPE: 'Invalid question type',
  QUESTION_INVALID: 'Invalid question data',

  // Attempt
  ATTEMPT_NOT_FOUND: 'Attempt not found',
  ATTEMPT_NOT_IN_PROGRESS: 'Attempt is not in progress',
  ATTEMPT_TIME_EXPIRED: 'Quiz time has expired',
  ATTEMPT_INVALID_ANSWER: 'Invalid answer format',

  // Validation
  VALIDATION_ERROR: 'Validation error',
  INVALID_INPUT: 'Invalid input provided',
  MISSING_REQUIRED_FIELD: 'Missing required field',

  // Database
  DATABASE_ERROR: 'Database error occurred',
  DATABASE_CONNECTION_ERROR: 'Failed to connect to database',

  // Server
  INTERNAL_SERVER_ERROR: 'Internal server error',
  NOT_IMPLEMENTED: 'Feature not implemented',
  SERVICE_UNAVAILABLE: 'Service is temporarily unavailable',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',

  // Not Found
  NOT_FOUND: 'Resource not found',
  RESOURCE_NOT_FOUND: 'Requested resource not found',

  // Conflict
  CONFLICT: 'Conflict detected',
  DUPLICATE_ENTRY: 'Duplicate entry',
} as const;

export type ErrorMessage = (typeof ERROR_MESSAGES)[keyof typeof ERROR_MESSAGES];
