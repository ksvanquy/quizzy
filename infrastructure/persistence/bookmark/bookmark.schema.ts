import { Schema, model, models, Document, Types } from 'mongoose';

export interface IBookmarkSchema extends Document {
  _id: Types.ObjectId;
  userId: string;
  quizId: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookmarkSchema = new Schema<IBookmarkSchema>(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },
    quizId: {
      type: String,
      ref: 'Quiz',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'bookmarks',
  }
);

// Compound unique index to prevent duplicate bookmarks
bookmarkSchema.index({ userId: 1, quizId: 1 }, { unique: true });

export const BookmarkModel = models.Bookmark || model<IBookmarkSchema>('Bookmark', bookmarkSchema);
export { bookmarkSchema };
