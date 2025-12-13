/**
 * Application Constants
 * Static values used throughout the application
 */

// Question Types
export const QUESTION_TYPES = {
  SINGLE_CHOICE: 'single_choice',
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  FILL_BLANK: 'fill_blank',
  CLOZE_TEST: 'cloze_test',
  NUMERIC_INPUT: 'numeric_input',
  ORDERING: 'ordering',
  MATCHING: 'matching',
} as const;

export type QuestionType = (typeof QUESTION_TYPES)[keyof typeof QUESTION_TYPES];

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Quiz Difficulty Levels
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[keyof typeof DIFFICULTY_LEVELS];

// Quiz Status
export const QUIZ_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const;

export type QuizStatus = (typeof QUIZ_STATUS)[keyof typeof QUIZ_STATUS];

// Attempt Status
export const ATTEMPT_STATUS = {
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  GRADED: 'graded',
} as const;

export type AttemptStatus = (typeof ATTEMPT_STATUS)[keyof typeof ATTEMPT_STATUS];

// Sort Order
export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type SortOrder = (typeof SORT_ORDER)[keyof typeof SORT_ORDER];

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  URL: /^https?:\/\/.+/,
} as const;

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// Cache Keys
export const CACHE_KEYS = {
  CATEGORIES: 'categories:all',
  CATEGORY_BY_ID: (id: string) => `category:${id}`,
  QUIZZES: 'quizzes:all',
  QUIZ_BY_ID: (id: string) => `quiz:${id}`,
  QUESTIONS: 'questions:all',
  QUESTION_BY_ID: (id: string) => `question:${id}`,
  USER_BY_ID: (id: string) => `user:${id}`,
} as const;

// Time Constants (in milliseconds)
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
} as const;

// Scoring Constants
export const SCORING = {
  MIN_POINTS: 0,
  MAX_POINTS: 100,
  PASSING_PERCENTAGE: 50,
} as const;

// Validation Constraints
export const VALIDATION = {
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 20,
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  MIN_QUIZ_TITLE_LENGTH: 3,
  MAX_QUIZ_TITLE_LENGTH: 200,
  MIN_QUIZ_DURATION: 1,
  MAX_QUIZ_DURATION: 300,
  MIN_QUESTION_TEXT_LENGTH: 5,
  MAX_QUESTION_TEXT_LENGTH: 2000,
} as const;
