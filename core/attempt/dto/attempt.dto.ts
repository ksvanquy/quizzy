/**
 * Attempt DTOs - Data Transfer Objects for attempt operations
 */

// Submit Answer DTO
export interface SubmitAnswerDto {
  questionId: string;
  userAnswer: any;
}

// Submit Attempt DTO
export interface SubmitAttemptDto {
  answers: SubmitAnswerDto[];
}

// Answer Response DTO
export interface AnswerResponseDto {
  questionId: string;
  userAnswer: any;
  isCorrect: boolean;
  pointsEarned: number;
}

// Attempt Response DTO
export interface AttemptResponseDto {
  id: string;
  userId: string;
  quizId: string;
  answers: AnswerResponseDto[];
  totalScore: number;
  passed: boolean;
  timeSpent: number;
  startedAt: Date;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Attempt Summary DTO
export interface AttemptSummaryDto {
  id: string;
  quizId: string;
  totalScore: number;
  scorePercentage: number;
  passed: boolean;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  timeSpent: number;
  duration: string;
  submittedAt: Date;
}

// Attempt Statistics DTO
export interface AttemptStatisticsDto {
  totalAttempts: number;
  bestScore: number;
  averageScore: number;
  successRate: number; // percentage
  totalTimeSpent: number;
}
