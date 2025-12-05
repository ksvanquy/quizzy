import { Schema, model, models, Document, Types } from 'mongoose';

export interface IQuiz extends Document {
  title: string;
  slug: string;
  description?: string;
  category: Types.ObjectId;
  createdBy: Types.ObjectId;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // in minutes
  totalPoints: number;
  passingScore: number;
  status: 'active' | 'draft' | 'archived';
  maxAttempts: number; // 0 = unlimited
  questionIds: Types.ObjectId[];
  questionSelection: {
    mode: 'manual' | 'random';
    manualQuestionIds?: Types.ObjectId[];
    sourceTopics?: string[];
    randomCounts?: {
      easy: number;
      medium: number;
      hard: number;
    };
  };
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  revealAnswersAfterSubmission: boolean;
  tags: string[];
  totalAttempts: number;
  averageScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const quizSchema = new Schema<IQuiz>(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: String,
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    duration: {
      type: Number,
      required: true, // minutes
      min: 1,
    },
    totalPoints: {
      type: Number,
      required: true,
    },
    passingScore: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'draft', 'archived'],
      default: 'active',
    },
    maxAttempts: {
      type: Number,
      default: 0, // 0 = unlimited
      min: 0,
    },
    questionIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Question',
      default: [],
    },
    questionSelection: {
      type: {
        mode: {
          type: String,
          enum: ['manual', 'random'],
          default: 'manual',
        },
        manualQuestionIds: [Schema.Types.ObjectId],
        sourceTopics: [String],
        randomCounts: {
          easy: { type: Number, default: 0 },
          medium: { type: Number, default: 0 },
          hard: { type: Number, default: 0 },
        },
      },
      default: { mode: 'manual' },
    },
    shuffleQuestions: {
      type: Boolean,
      default: false,
    },
    shuffleOptions: {
      type: Boolean,
      default: false,
    },
    revealAnswersAfterSubmission: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    totalAttempts: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes
quizSchema.index({ category: 1, status: 1 });
quizSchema.index({ status: 1 });
quizSchema.index({ createdBy: 1 });

export const Quiz = models.Quiz || model<IQuiz>('Quiz', quizSchema);
