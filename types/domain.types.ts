/**
 * Domain Types
 * Business logic and domain model types
 */

import { QuestionType, UserRole, DifficultyLevel, QuizStatus, AttemptStatus } from '@/constants/app.constants';

/**
 * User Domain Type
 */
export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // Only in internal operations, never expose
  name: string;
  avatar?: string;
  role: UserRole;
  bio?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category Domain Type
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string | null; // null for root categories
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Quiz Domain Type
 */
export interface Quiz {
  id: string;
  title: string;
  slug: string;
  description?: string;
  categoryId: string;
  createdById: string;
  difficulty: DifficultyLevel;
  duration: number; // minutes
  totalPoints: number;
  passingScore: number;
  status: QuizStatus;
  maxAttempts: number; // 0 = unlimited
  questionIds: string[];
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  revealAnswersAfterSubmission: boolean;
  tags?: string[];
  totalAttempts?: number;
  averageScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Question Domain Type (Base)
 */
export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  points: number;
  explanation?: string;
  categoryIds?: string[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Question with options (Single/Multiple choice)
 */
export interface ChoiceQuestion extends Question {
  type: 'single_choice' | 'multiple_choice';
  optionIds: string[];
  correctOptionIds: string[]; // single choice = 1, multiple = 1+
}

/**
 * True/False Question
 */
export interface BooleanQuestion extends Question {
  type: 'true_false';
  correctBoolean: boolean;
}

/**
 * Fill Blank Question
 */
export interface FillBlankQuestion extends Question {
  type: 'fill_blank';
  correctAnswers: string[];
  blankCount: number;
}

/**
 * Cloze Test Question
 */
export interface CloseTestQuestion extends Question {
  type: 'cloze_test';
  correctAnswers: string[];
}

/**
 * Numeric Input Question
 */
export interface NumericQuestion extends Question {
  type: 'numeric_input';
  correctNumber: number;
  tolerance?: number; // for approximate answers
}

/**
 * Ordering Question
 */
export interface OrderingQuestion extends Question {
  type: 'ordering';
  itemIds: string[]; // order of items
  correctOrder: string[];
}

/**
 * Matching Question
 */
export interface MatchingQuestion extends Question {
  type: 'matching';
  leftItemIds: string[];
  rightItemIds: string[];
  correctPairs: Record<string, string>; // leftId -> rightId
}

/**
 * Attempt Domain Type
 */
export interface Attempt {
  id: string;
  userId: string;
  quizId: string;
  answers: Answer[];
  totalScore: number;
  passed: boolean;
  timeSpent: number; // seconds
  startedAt: Date;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Answer in Attempt
 */
export interface Answer {
  questionId: string;
  userAnswer: any;
  isCorrect: boolean;
  pointsEarned: number;
}

/**
 * Bookmark Domain Type
 */
export interface Bookmark {
  id: string;
  userId: string;
  quizId: string;
  createdAt: Date;
}

/**
 * Watchlist Domain Type
 */
export interface Watchlist {
  id: string;
  userId: string;
  quizId: string;
  createdAt: Date;
}

/**
 * Token Payload
 */
export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Auth Token Response
 */
export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

/**
 * Generic Entity Type
 */
export interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
