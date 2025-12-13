/**
 * Attempt Entity - Domain model for quiz submissions
 * Records user's attempt at answering a quiz
 */
export interface Answer {
  questionId: string;
  userAnswer: any; // varies by question type
  isCorrect: boolean;
  pointsEarned: number;
}

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

export class AttemptEntity implements Attempt {
  id: string;
  userId: string;
  quizId: string;
  answers: Answer[];
  totalScore: number;
  passed: boolean;
  timeSpent: number;
  startedAt: Date;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Attempt) {
    this.id = data.id;
    this.userId = data.userId;
    this.quizId = data.quizId;
    this.answers = data.answers;
    this.totalScore = data.totalScore;
    this.passed = data.passed;
    this.timeSpent = data.timeSpent;
    this.startedAt = data.startedAt;
    this.submittedAt = data.submittedAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  getDuration(): number {
    return this.submittedAt.getTime() - this.startedAt.getTime();
  }

  getPercentageScore(totalPoints: number): number {
    if (totalPoints === 0) return 0;
    return (this.totalScore / totalPoints) * 100;
  }

  isComplete(): boolean {
    return this.submittedAt !== null;
  }
}
