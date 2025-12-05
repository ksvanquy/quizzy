import { Schema, model, models, Document, Types } from 'mongoose';

export interface IMatching extends Document {
  text: string;
  imageUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic?: string;
  categoryId: Types.ObjectId;
  quizId?: Types.ObjectId;
  shuffleLeft: boolean;
  shuffleRight: boolean;
  explanation?: string;
  points: number;
  
  // Left side items
  leftItems: Array<{
    id: string;
    text: string;
    imageUrl?: string;
  }>;
  
  // Right side items
  rightItems: Array<{
    id: string;
    text: string;
    imageUrl?: string;
  }>;
  
  // Correct pairs (map of leftId -> rightId)
  correctPairs: Record<string, string>;
  
  createdAt: Date;
  updatedAt: Date;
}

const matchingSchema = new Schema<IMatching>(
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
    shuffleLeft: {
      type: Boolean,
      default: true,
    },
    shuffleRight: {
      type: Boolean,
      default: true,
    },
    explanation: String,
    points: {
      type: Number,
      default: 1,
    },
    leftItems: [
      {
        id: String,
        text: String,
        imageUrl: String,
      },
    ],
    rightItems: [
      {
        id: String,
        text: String,
        imageUrl: String,
      },
    ],
    correctPairs: Schema.Types.Mixed,
  },
  { timestamps: true }
);

// Index for quick lookup by category and difficulty
matchingSchema.index({ categoryId: 1, difficulty: 1 });
// Index for quiz-specific queries
matchingSchema.index({ quizId: 1 });

export const Matching = models.Matching || model<IMatching>('Matching', matchingSchema);
