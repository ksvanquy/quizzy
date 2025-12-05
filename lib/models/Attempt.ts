import { Schema, model, models, Document, Types } from 'mongoose';

export interface IAttempt extends Document {
  userId: Types.ObjectId;
  quizId: Types.ObjectId;
  startedAt: Date;
  submittedAt?: Date;
  status: 'in_progress' | 'submitted' | 'graded';
  answers: Array<{
    questionId: Types.ObjectId;
    userAnswer: any;
    isCorrect?: boolean;
    pointsEarned?: number;
  }>;
  totalScore: number;
  isPassed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const attemptSchema = new Schema<IAttempt>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quizId: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: Date,
    status: {
      type: String,
      enum: ['in_progress', 'submitted', 'graded'],
      default: 'in_progress',
    },
    answers: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: 'Question',
        },
        userAnswer: Schema.Types.Mixed,
        isCorrect: Boolean,
        pointsEarned: Number,
      },
    ],
    totalScore: {
      type: Number,
      default: 0,
    },
    isPassed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Attempt = models.Attempt || model<IAttempt>('Attempt', attemptSchema);
