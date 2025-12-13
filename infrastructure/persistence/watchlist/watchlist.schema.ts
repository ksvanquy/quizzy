import { Schema, model, models, Document, Types } from 'mongoose';

export interface IWatchlistSchema extends Document {
  _id: Types.ObjectId;
  userId: string;
  quizId: string;
  createdAt: Date;
  updatedAt: Date;
}

const watchlistSchema = new Schema<IWatchlistSchema>(
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
    collection: 'watchlists',
  }
);

// Compound unique index to prevent duplicate watchlist entries
watchlistSchema.index({ userId: 1, quizId: 1 }, { unique: true });

export const WatchlistModel = models.Watchlist || model<IWatchlistSchema>('Watchlist', watchlistSchema);
export { watchlistSchema };
