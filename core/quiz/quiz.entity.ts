/**
 * Quiz Entity - Domain model for quizzes
 * Contains quiz configuration and metadata
 */
export interface Quiz {
  id: string;
  title: string;
  slug: string;
  description?: string;
  categoryId: string;
  createdById: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // minutes
  totalPoints: number;
  passingScore: number;
  status: 'draft' | 'active' | 'archived';
  maxAttempts: number; // 0 = unlimited
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

export class QuizEntity implements Quiz {
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

  constructor(data: Quiz) {
    this.id = data.id;
    this.title = data.title;
    this.slug = data.slug;
    this.description = data.description;
    this.categoryId = data.categoryId;
    this.createdById = data.createdById;
    this.difficulty = data.difficulty;
    this.duration = data.duration;
    this.totalPoints = data.totalPoints;
    this.passingScore = data.passingScore;
    this.status = data.status;
    this.maxAttempts = data.maxAttempts;
    this.questionIds = data.questionIds;
    this.shuffleQuestions = data.shuffleQuestions;
    this.shuffleOptions = data.shuffleOptions;
    this.revealAnswersAfterSubmission = data.revealAnswersAfterSubmission;
    this.tags = data.tags;
    this.totalAttempts = data.totalAttempts;
    this.averageScore = data.averageScore;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  isActive(): boolean {
    return this.status === 'active';
  }

  isDraft(): boolean {
    return this.status === 'draft';
  }

  isArchived(): boolean {
    return this.status === 'archived';
  }

  canAttempt(currentAttempts: number): boolean {
    if (this.maxAttempts === 0) return true;
    return currentAttempts < this.maxAttempts;
  }
}
