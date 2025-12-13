import { z } from 'zod';
import { REGEX_PATTERNS, VALIDATION } from '@/constants/app.constants';

/**
 * Zod validation schemas for all DTOs
 */

// ============ USER SCHEMAS ============
export const createUserSchema = z.object({
  username: z
    .string()
    .min(VALIDATION.MIN_USERNAME_LENGTH, `Username must be at least ${VALIDATION.MIN_USERNAME_LENGTH} characters`)
    .max(VALIDATION.MAX_USERNAME_LENGTH, `Username must be at most ${VALIDATION.MAX_USERNAME_LENGTH} characters`)
    .regex(REGEX_PATTERNS.USERNAME, 'Invalid username format'),
  email: z
    .string()
    .email('Invalid email address')
    .regex(REGEX_PATTERNS.EMAIL, 'Invalid email format'),
  password: z
    .string()
    .min(VALIDATION.MIN_PASSWORD_LENGTH, `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`)
    .max(VALIDATION.MAX_PASSWORD_LENGTH, `Password must be at most ${VALIDATION.MAX_PASSWORD_LENGTH} characters`)
    .regex(REGEX_PATTERNS.PASSWORD, 'Password must contain at least one letter and one number'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters'),
  role: z.enum(['admin', 'teacher', 'student']).optional(),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters')
    .optional(),
  avatar: z.string().url('Invalid URL').optional(),
  bio: z.string().max(500, 'Bio must be at most 500 characters').optional(),
  phone: z.string().regex(/^\+?[0-9\s\-()]{7,}$/, 'Invalid phone number').optional(),
  address: z.string().max(200, 'Address must be at most 200 characters').optional(),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(VALIDATION.MIN_PASSWORD_LENGTH, `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`)
      .max(VALIDATION.MAX_PASSWORD_LENGTH, `Password must be at most ${VALIDATION.MAX_PASSWORD_LENGTH} characters`),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

// ============ CATEGORY SCHEMAS ============
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Category name must be at most 100 characters'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  icon: z.string().url('Invalid URL').optional(),
  parentId: z.string().uuid('Invalid parent category ID').nullable().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Category name must be at most 100 characters')
    .optional(),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  icon: z.string().url('Invalid URL').optional(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const moveCategorySchema = z.object({
  newParentId: z.string().uuid('Invalid parent category ID').nullable(),
});

// ============ QUIZ SCHEMAS ============
export const createQuizSchema = z.object({
  title: z
    .string()
    .min(VALIDATION.MIN_QUIZ_TITLE_LENGTH, `Title must be at least ${VALIDATION.MIN_QUIZ_TITLE_LENGTH} characters`)
    .max(VALIDATION.MAX_QUIZ_TITLE_LENGTH, `Title must be at most ${VALIDATION.MAX_QUIZ_TITLE_LENGTH} characters`),
  description: z.string().max(1000, 'Description must be at most 1000 characters').optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  duration: z
    .number()
    .int('Duration must be an integer')
    .min(1, 'Duration must be at least 1 minute')
    .max(300, 'Duration must be at most 300 minutes'),
  totalPoints: z
    .number()
    .int('Total points must be an integer')
    .min(1, 'Total points must be at least 1')
    .max(1000, 'Total points must be at most 1000'),
  passingScore: z
    .number()
    .int('Passing score must be an integer')
    .min(0, 'Passing score cannot be negative'),
  maxAttempts: z.number().int().min(0).optional(),
  shuffleQuestions: z.boolean().optional(),
  shuffleOptions: z.boolean().optional(),
  revealAnswersAfterSubmission: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateQuizSchema = z.object({
  title: z
    .string()
    .min(VALIDATION.MIN_QUIZ_TITLE_LENGTH)
    .max(VALIDATION.MAX_QUIZ_TITLE_LENGTH)
    .optional(),
  description: z.string().max(1000).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  duration: z.number().int().min(1).max(300).optional(),
  totalPoints: z.number().int().min(1).max(1000).optional(),
  passingScore: z.number().int().min(0).optional(),
  maxAttempts: z.number().int().min(0).optional(),
  shuffleQuestions: z.boolean().optional(),
  shuffleOptions: z.boolean().optional(),
  revealAnswersAfterSubmission: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

// ============ QUESTION SCHEMAS ============
export const createQuestionBaseSchema = z.object({
  text: z
    .string()
    .min(VALIDATION.MIN_QUESTION_TEXT_LENGTH, `Question text must be at least ${VALIDATION.MIN_QUESTION_TEXT_LENGTH} characters`)
    .max(VALIDATION.MAX_QUESTION_TEXT_LENGTH, `Question text must be at most ${VALIDATION.MAX_QUESTION_TEXT_LENGTH} characters`),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  points: z
    .number()
    .int('Points must be an integer')
    .min(1, 'Points must be at least 1')
    .max(100, 'Points must be at most 100'),
  explanation: z.string().max(1000, 'Explanation must be at most 1000 characters').optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string()).optional(),
});

export const singleChoiceQuestionSchema = createQuestionBaseSchema.extend({
  type: z.literal('single_choice'),
  optionIds: z.array(z.string().uuid()).min(2, 'Must have at least 2 options'),
  correctOptionId: z.string().uuid('Invalid option ID'),
});

export const multipleChoiceQuestionSchema = createQuestionBaseSchema.extend({
  type: z.literal('multiple_choice'),
  optionIds: z.array(z.string().uuid()).min(2, 'Must have at least 2 options'),
  correctOptionIds: z.array(z.string().uuid()).min(1, 'Must have at least 1 correct option'),
});

export const trueFalseQuestionSchema = createQuestionBaseSchema.extend({
  type: z.literal('true_false'),
  correctAnswer: z.boolean(),
});

export const fillBlankQuestionSchema = createQuestionBaseSchema.extend({
  type: z.literal('fill_blank'),
  correctAnswers: z.array(z.string()).min(1, 'Must have at least 1 correct answer'),
  blankCount: z.number().int().min(1),
});

export const closeTestQuestionSchema = createQuestionBaseSchema.extend({
  type: z.literal('cloze_test'),
  correctAnswers: z.array(z.string()).min(1, 'Must have at least 1 correct answer'),
});

export const numericInputQuestionSchema = createQuestionBaseSchema.extend({
  type: z.literal('numeric_input'),
  correctNumber: z.number(),
  tolerance: z.number().min(0),
});

export const orderingQuestionSchema = createQuestionBaseSchema.extend({
  type: z.literal('ordering'),
  itemIds: z.array(z.string()).min(2, 'Must have at least 2 items'),
  correctOrder: z.array(z.string()).min(2, 'Must have correct order for all items'),
});

export const matchingQuestionSchema = createQuestionBaseSchema.extend({
  type: z.literal('matching'),
  leftItemIds: z.array(z.string()).min(2, 'Must have at least 2 left items'),
  rightItemIds: z.array(z.string()).min(2, 'Must have at least 2 right items'),
  correctPairs: z.record(z.string(), z.string()).refine((pairs) => Object.keys(pairs).length >= 1, {
    message: 'Must have at least 1 correct pair',
  }),
});

export const createQuestionSchema = z.union([
  singleChoiceQuestionSchema,
  multipleChoiceQuestionSchema,
  trueFalseQuestionSchema,
  fillBlankQuestionSchema,
  closeTestQuestionSchema,
  numericInputQuestionSchema,
  orderingQuestionSchema,
  matchingQuestionSchema,
]);

export const updateQuestionSchema = z.object({
  text: z.string().min(VALIDATION.MIN_QUESTION_TEXT_LENGTH).max(VALIDATION.MAX_QUESTION_TEXT_LENGTH).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  points: z.number().int().min(1).max(100).optional(),
  explanation: z.string().max(1000).optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string()).optional(),
});

// ============ AUTH SCHEMAS ============
export const loginSchema = z
  .object({
    email: z.string().email('Invalid email address').optional(),
    username: z.string().min(1, 'Username is required').optional(),
    password: z.string().min(1, 'Password is required'),
  })
  .refine((data) => data.email || data.username, {
    message: 'Either email or username is required',
    path: ['email'],
  });

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(VALIDATION.MIN_USERNAME_LENGTH, `Username must be at least ${VALIDATION.MIN_USERNAME_LENGTH} characters`)
      .max(VALIDATION.MAX_USERNAME_LENGTH, `Username must be at most ${VALIDATION.MAX_USERNAME_LENGTH} characters`),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(VALIDATION.MIN_PASSWORD_LENGTH, `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`)
      .max(VALIDATION.MAX_PASSWORD_LENGTH, `Password must be at most ${VALIDATION.MAX_PASSWORD_LENGTH} characters`),
    confirmPassword: z.string(),
    name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const changePasswordAuthSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(VALIDATION.MIN_PASSWORD_LENGTH, `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`)
      .max(VALIDATION.MAX_PASSWORD_LENGTH, `Password must be at most ${VALIDATION.MAX_PASSWORD_LENGTH} characters`),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

// ============ ATTEMPT SCHEMAS ============
export const submitAnswerSchema = z.object({
  questionId: z.string().uuid('Invalid question ID'),
  userAnswer: z.any(),
});

export const submitAttemptSchema = z.object({
  answers: z.array(submitAnswerSchema).min(1, 'Must submit at least one answer'),
});

// ============ GENERAL SCHEMAS ============
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID'),
});
