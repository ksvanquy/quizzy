import { Schema, model, models, Document, Types } from 'mongoose';

export interface IQuestion extends Document {
  text: string;
  imageUrl?: string;
  type: 'single_choice' | 'multi_choice' | 'true_false' | 'ordering' | 'matching' | 'fill_blank' | 'numeric_input' | 'cloze_test' | 'image_choice';
  difficulty: 'easy' | 'medium' | 'hard';
  topic?: string;
  categoryId: Types.ObjectId;
  quizId?: Types.ObjectId;
  shuffleOptions: boolean;
  caseSensitive: boolean;
  explanation?: string;
  points: number;
  
  // Choice questions
  optionIds?: Types.ObjectId[];
  correctOptionId?: Types.ObjectId;
  correctOptionIds?: Types.ObjectId[];
  
  // True/False
  correctBoolean?: boolean;
  
  // Ordering
  correctOrder?: string[];
  
  // Matching
  correctPairs?: Record<string, string>;
  
  // Fill blank / Cloze
  correctAnswers?: string[];
  
  // Numeric
  correctNumber?: number;
  tolerance?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    text: {
      type: String,
      required: true,
    },
    imageUrl: String,
    type: {
      type: String,
      enum: ['single_choice', 'multi_choice', 'true_false', 'ordering', 'matching', 'fill_blank', 'numeric_input', 'cloze_test', 'image_choice'],
      required: true,
    },
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
    shuffleOptions: {
      type: Boolean,
      default: true,
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
    // Choice questions
    optionIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Option',
      },
    ],
    correctOptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Option',
    },
    correctOptionIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Option',
      },
    ],
    // True/False
    correctBoolean: Boolean,
    // Ordering
    correctOrder: [String],
    // Matching
    correctPairs: Schema.Types.Mixed,
    // Fill blank / Cloze
    correctAnswers: [String],
    // Numeric
    correctNumber: Number,
    tolerance: Number,
  },
  { timestamps: true }
);

// Index for quick lookup by category and difficulty
questionSchema.index({ categoryId: 1, difficulty: 1 });
// Index for quiz-specific queries
questionSchema.index({ quizId: 1 });

export const Question = models.Question || model<IQuestion>('Question', questionSchema);
