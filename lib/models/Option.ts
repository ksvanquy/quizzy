import { Schema, model, models, Document, Types } from 'mongoose';

export interface IOption extends Document {
  text: string;
  imageUrl?: string;
  questionId: Types.ObjectId;
  isCorrect: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const optionSchema = new Schema<IOption>(
  {
    text: {
      type: String,
      required: true,
    },
    imageUrl: String,
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for quick lookup by question
optionSchema.index({ questionId: 1, displayOrder: 1 });

export const Option = models.Option || model<IOption>('Option', optionSchema);
