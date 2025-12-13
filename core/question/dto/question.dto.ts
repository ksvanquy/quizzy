/**
 * Question DTOs - Data Transfer Objects for question operations
 */

// Base Create Question DTO
export interface CreateQuestionBaseDto {
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  explanation?: string;
  categoryIds?: string[];
  tags?: string[];
}

// Single Choice Question DTO
export interface CreateSingleChoiceQuestionDto extends CreateQuestionBaseDto {
  type: 'single_choice';
  optionIds: string[];
  correctOptionId: string;
}

// Multiple Choice Question DTO
export interface CreateMultipleChoiceQuestionDto extends CreateQuestionBaseDto {
  type: 'multiple_choice';
  optionIds: string[];
  correctOptionIds: string[];
}

// True/False Question DTO
export interface CreateTrueFalseQuestionDto extends CreateQuestionBaseDto {
  type: 'true_false';
  correctAnswer: boolean;
}

// Fill Blank Question DTO
export interface CreateFillBlankQuestionDto extends CreateQuestionBaseDto {
  type: 'fill_blank';
  correctAnswers: string[];
  blankCount: number;
}

// Cloze Test Question DTO
export interface CreateCloseTestQuestionDto extends CreateQuestionBaseDto {
  type: 'cloze_test';
  correctAnswers: string[];
}

// Numeric Input Question DTO
export interface CreateNumericInputQuestionDto extends CreateQuestionBaseDto {
  type: 'numeric_input';
  correctNumber: number;
  tolerance: number;
}

// Ordering Question DTO
export interface CreateOrderingQuestionDto extends CreateQuestionBaseDto {
  type: 'ordering';
  itemIds: string[];
  correctOrder: string[];
}

// Matching Question DTO
export interface CreateMatchingQuestionDto extends CreateQuestionBaseDto {
  type: 'matching';
  leftItemIds: string[];
  rightItemIds: string[];
  correctPairs: Record<string, string>;
}

export type CreateQuestionDto =
  | CreateSingleChoiceQuestionDto
  | CreateMultipleChoiceQuestionDto
  | CreateTrueFalseQuestionDto
  | CreateFillBlankQuestionDto
  | CreateCloseTestQuestionDto
  | CreateNumericInputQuestionDto
  | CreateOrderingQuestionDto
  | CreateMatchingQuestionDto;

// Update Question DTO (partial)
export interface UpdateQuestionDto {
  text?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  points?: number;
  explanation?: string;
  categoryIds?: string[];
  tags?: string[];
}

// Question Response DTO
export interface QuestionResponseDto {
  id: string;
  text: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  explanation?: string;
  categoryIds?: string[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any; // For type-specific fields
}
