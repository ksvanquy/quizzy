import { Schema, model, models, Document, Types } from 'mongoose';

export interface IFillBlank extends Document {
  text: string;
  imageUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic?: string;
  categoryId: Types.ObjectId;
  quizId?: Types.ObjectId;
  caseSensitive: boolean;
  explanation?: string;
  points: number;
  
  // Correct answers (multiple answers can be accepted)
  correctAnswers: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

const fillBlankSchema = new Schema<IFillBlank>(
  {
    text: {
      type: String,
      required: true,
      description: 'Question text with blanks marked, e.g., "The capital of France is _____"',
    },
    imageUrl: String,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    topic: String,
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    quizId: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
    },
    caseSensitive: {
      type: Boolean,
      default: false,
    },
    explanation: String,
    points: {
      type: Number,
      default: 1,
    },
    correctAnswers: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

// Index for quick lookup by category and difficulty
fillBlankSchema.index({ categoryId: 1, difficulty: 1 });
// Index for quiz-specific queries
fillBlankSchema.index({ quizId: 1 });

export const FillBlank = models.FillBlank || model<IFillBlank>('FillBlank', fillBlankSchema);
