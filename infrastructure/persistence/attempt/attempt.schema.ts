import { Schema, model, models, Document, Types } from 'mongoose';

export interface IAnswerSchema {
  questionId: Types.ObjectId;
  userAnswer: any;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface IAttemptSchema extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  quizId: Types.ObjectId;
  answers: IAnswerSchema[];
  totalScore: number;
  passed: boolean;
  timeSpent: number; // in seconds
  startedAt: Date;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new Schema<IAnswerSchema>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    userAnswer: Schema.Types.Mixed,
    isCorrect: {
      type: Boolean,
      default: false,
    },
    pointsEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const attemptSchema = new Schema<IAttemptSchema>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    quizId: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true,
    },
    answers: [answerSchema],
    totalScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    passed: {
      type: Boolean,
      default: false,
      index: true,
    },
    timeSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    startedAt: {
      type: Date,
      default: () => new Date(),
    },
    submittedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'attempts',
  }
);

// Indexes for performance
attemptSchema.index({ userId: 1, quizId: 1 });
attemptSchema.index({ userId: 1, submittedAt: -1 });
attemptSchema.index({ quizId: 1, submittedAt: -1 });
attemptSchema.index({ userId: 1, quizId: 1, passed: 1 });

export const AttemptModel = models.Attempt || model<IAttemptSchema>('Attempt', attemptSchema);
export { attemptSchema };
