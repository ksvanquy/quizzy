import { Schema, model, models, Document, Types } from 'mongoose';

export interface IWatchlist extends Document {
  userId: Types.ObjectId;
  quizId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const watchlistSchema = new Schema<IWatchlist>(
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

watchlistSchema.index({ userId: 1, quizId: 1 }, { unique: true });

export const Watchlist = models.Watchlist || model<IWatchlist>('Watchlist', watchlistSchema);
