/**
 * Question Entity - Domain model for quiz questions
 * Supports 8 different question types
 */
export interface BaseQuestion {
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
}

// Specific question types
export interface SingleChoiceQuestion extends BaseQuestion {
  type: 'single_choice';
  optionIds: string[];
  correctOptionId: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  optionIds: string[];
  correctOptionIds: string[];
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true_false';
  correctAnswer: boolean;
}

export interface FillBlankQuestion extends BaseQuestion {
  type: 'fill_blank';
  correctAnswers: string[];
  blankCount: number;
}

export interface CloseTestQuestion extends BaseQuestion {
  type: 'cloze_test';
  correctAnswers: string[];
}

export interface NumericInputQuestion extends BaseQuestion {
  type: 'numeric_input';
  correctNumber: number;
  tolerance: number;
}

export interface OrderingQuestion extends BaseQuestion {
  type: 'ordering';
  itemIds: string[];
  correctOrder: string[];
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  leftItemIds: string[];
  rightItemIds: string[];
  correctPairs: Record<string, string>;
}

export type Question =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | FillBlankQuestion
  | CloseTestQuestion
  | NumericInputQuestion
  | OrderingQuestion
  | MatchingQuestion;

export class QuestionEntity {
  static create(data: Question): Question {
    return data;
  }

  static isMultipleAnswer(question: Question): boolean {
    return ['multiple_choice', 'cloze_test', 'fill_blank'].includes(question.type);
  }

  static isSingleAnswer(question: Question): boolean {
    return ['single_choice', 'true_false', 'numeric_input'].includes(question.type);
  }

  static isOrdering(question: Question): boolean {
    return question.type === 'ordering';
  }

  static isMatching(question: Question): boolean {
    return question.type === 'matching';
  }
}
