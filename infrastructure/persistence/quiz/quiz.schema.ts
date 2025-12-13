import { Schema, model, models, Document, Types } from 'mongoose';

export interface IQuizSchema extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  categoryId: Types.ObjectId;
  createdById: Types.ObjectId;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // in minutes
  totalPoints: number;
  passingScore: number;
  status: 'active' | 'draft' | 'archived';
  maxAttempts: number; // 0 = unlimited
  questionIds: Types.ObjectId[];
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  revealAnswersAfterSubmission: boolean;
  tags: string[];
  totalAttempts: number;
  averageScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const quizSchema = new Schema<IQuizSchema>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: null,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    createdById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPoints: {
      type: Number,
      required: true,
      min: 0,
    },
    passingScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'draft', 'archived'],
      default: 'draft',
      index: true,
    },
    maxAttempts: {
      type: Number,
      default: 0, // 0 = unlimited
      min: 0,
    },
    questionIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
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
      default: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    totalAttempts: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'quizzes',
  }
);

// Indexes for performance
quizSchema.index({ categoryId: 1, status: 1 });
quizSchema.index({ createdById: 1, status: 1 });
quizSchema.index({ slug: 1, status: 1 });

export const QuizModel = models.Quiz || model<IQuizSchema>('Quiz', quizSchema);
export { quizSchema };
