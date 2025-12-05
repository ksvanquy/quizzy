import { Schema, model, models, Document, Types } from 'mongoose';

export interface INumericInput extends Document {
  text: string;
  imageUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic?: string;
  categoryId: Types.ObjectId;
  quizId?: Types.ObjectId;
  explanation?: string;
  points: number;
  
  // Correct numeric answer
  correctNumber: number;
  
  // Tolerance for accepting answers (e.g., 3.14 ± 0.01)
  tolerance: number;
  
  // Unit of measurement (optional, e.g., "cm", "kg")
  unit?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const numericInputSchema = new Schema<INumericInput>(
  {
    text: {
      type: String,
      required: true,
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
    explanation: String,
    points: {
      type: Number,
      default: 1,
    },
    correctNumber: {
      type: Number,
      required: true,
    },
    tolerance: {
      type: Number,
      default: 0,
      min: 0,
    },
    unit: String,
  },
  { timestamps: true }
);

// Index for quick lookup by category and difficulty
numericInputSchema.index({ categoryId: 1, difficulty: 1 });
// Index for quiz-specific queries
numericInputSchema.index({ quizId: 1 });

export const NumericInput = models.NumericInput || model<INumericInput>('NumericInput', numericInputSchema);
