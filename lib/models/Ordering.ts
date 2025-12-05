import { Schema, model, models, Document, Types } from 'mongoose';

export interface IOrdering extends Document {
  text: string;
  imageUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic?: string;
  categoryId: Types.ObjectId;
  quizId?: Types.ObjectId;
  shuffleItems: boolean;
  explanation?: string;
  points: number;
  
  // Items to order
  items: Array<{
    id: string;
    text: string;
    imageUrl?: string;
  }>;
  
  // Correct order (array of item IDs)
  correctOrder: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

const orderingSchema = new Schema<IOrdering>(
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
    shuffleItems: {
      type: Boolean,
      default: true,
    },
    explanation: String,
    points: {
      type: Number,
      default: 1,
    },
    items: [
      {
        id: String,
        text: String,
        imageUrl: String,
      },
    ],
    correctOrder: [String],
  },
  { timestamps: true }
);

// Index for quick lookup by category and difficulty
orderingSchema.index({ categoryId: 1, difficulty: 1 });
// Index for quiz-specific queries
orderingSchema.index({ quizId: 1 });

export const Ordering = models.Ordering || model<IOrdering>('Ordering', orderingSchema);
