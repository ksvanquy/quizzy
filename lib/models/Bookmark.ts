import { Schema, model, models, Document, Types } from 'mongoose';

export interface IBookmark extends Document {
  userId: Types.ObjectId;
  quizId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
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
  },
  { timestamps: true }
);

bookmarkSchema.index({ userId: 1, quizId: 1 }, { unique: true });

export const Bookmark = models.Bookmark || model<IBookmark>('Bookmark', bookmarkSchema);
