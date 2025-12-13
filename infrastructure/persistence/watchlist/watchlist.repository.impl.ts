import { Model } from 'mongoose';
import { IWatchlistRepository } from '@/core/watchlist/watchlist.repository';
import { Watchlist } from '@/core/watchlist/watchlist.entity';
import { NotFoundError } from '@/core/shared/errors/not-found-error';
import { ConflictError } from '@/core/shared/errors/conflict-error';

export class WatchlistRepository implements IWatchlistRepository {
  constructor(private watchlistModel: Model<any>) {}

  async create(data: Partial<Watchlist>): Promise<Watchlist> {
    // Check if watchlist item already exists
    const existingWatchlist = await this.watchlistModel.findOne({
      userId: data.userId,
      quizId: data.quizId,
    });

    if (existingWatchlist) {
      throw new ConflictError('Quiz already in watchlist');
    }

    const watchlist = new this.watchlistModel(data);
    await watchlist.save();
    return this.mapToEntity(watchlist);
  }

  async findById(id: string): Promise<Watchlist | null> {
    const watchlist = await this.watchlistModel.findById(id).lean();
    return watchlist ? this.mapToEntity(watchlist) : null;
  }

  async delete(id: string): Promise<void> {
    const result = await this.watchlistModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('Watchlist item not found');
    }
  }

  async findByUser(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ items: Watchlist[]; total: number }> {
    const skip = (page - 1) * limit;
    const [watchlists, total] = await Promise.all([
      this.watchlistModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.watchlistModel.countDocuments({ userId }),
    ]);

    return {
      items: watchlists.map((watchlist) => this.mapToEntity(watchlist)),
      total,
    };
  }

  async findByUserAndQuiz(userId: string, quizId: string): Promise<Watchlist | null> {
    const watchlist = await this.watchlistModel.findOne({ userId, quizId }).lean();
    return watchlist ? this.mapToEntity(watchlist) : null;
  }

  async deleteByUserAndQuiz(userId: string, quizId: string): Promise<void> {
    const result = await this.watchlistModel.findOneAndDelete({ userId, quizId });
    if (!result) {
      throw new NotFoundError('Watchlist item not found');
    }
  }

  private mapToEntity(doc: any): Watchlist {
    return {
      id: doc._id?.toString() || doc.id,
      userId: doc.userId,
      quizId: doc.quizId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
