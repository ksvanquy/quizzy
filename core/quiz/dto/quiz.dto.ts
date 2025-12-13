/**
 * Quiz DTOs - Data Transfer Objects for quiz operations
 */

// Create Quiz DTO
export interface CreateQuizDto {
  title: string;
  description?: string;
  categoryId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  totalPoints: number;
  passingScore: number;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  revealAnswersAfterSubmission?: boolean;
  tags?: string[];
}

// Update Quiz DTO
export interface UpdateQuizDto {
  title?: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  duration?: number;
  totalPoints?: number;
  passingScore?: number;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  revealAnswersAfterSubmission?: boolean;
  tags?: string[];
}

// Add Question to Quiz DTO
export interface AddQuestionDto {
  questionId: string;
}

// Reorder Questions DTO
export interface ReorderQuestionsDto {
  questionIds: string[];
}

// Quiz Response DTO
export interface QuizResponseDto {
  id: string;
  title: string;
  slug: string;
  description?: string;
  categoryId: string;
  createdById: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  totalPoints: number;
  passingScore: number;
  status: 'draft' | 'active' | 'archived';
  maxAttempts: number;
  questionIds: string[];
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  revealAnswersAfterSubmission: boolean;
  tags: string[];
  totalAttempts: number;
  averageScore: number;
  createdAt: Date;
  updatedAt: Date;
}
