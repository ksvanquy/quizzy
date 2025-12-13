import { Model } from 'mongoose';
import { IBookmarkRepository } from '@/core/bookmark/bookmark.repository';
import { Bookmark } from '@/core/bookmark/bookmark.entity';
import { NotFoundError } from '@/core/shared/errors/not-found-error';
import { ConflictError } from '@/core/shared/errors/conflict-error';

export class BookmarkRepository implements IBookmarkRepository {
  constructor(private bookmarkModel: Model<any>) {}

  async create(data: Partial<Bookmark>): Promise<Bookmark> {
    // Check if bookmark already exists
    const existingBookmark = await this.bookmarkModel.findOne({
      userId: data.userId,
      quizId: data.quizId,
    });

    if (existingBookmark) {
      throw new ConflictError('Quiz already bookmarked');
    }

    const bookmark = new this.bookmarkModel(data);
    await bookmark.save();
    return this.mapToEntity(bookmark);
  }

  async findById(id: string): Promise<Bookmark | null> {
    const bookmark = await this.bookmarkModel.findById(id).lean();
    return bookmark ? this.mapToEntity(bookmark) : null;
  }

  async delete(id: string): Promise<void> {
    const result = await this.bookmarkModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('Bookmark not found');
    }
  }

  async findByUser(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ items: Bookmark[]; total: number }> {
    const skip = (page - 1) * limit;
    const [bookmarks, total] = await Promise.all([
      this.bookmarkModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.bookmarkModel.countDocuments({ userId }),
    ]);

    return {
      items: bookmarks.map((bookmark) => this.mapToEntity(bookmark)),
      total,
    };
  }

  async findByUserAndQuiz(userId: string, quizId: string): Promise<Bookmark | null> {
    const bookmark = await this.bookmarkModel.findOne({ userId, quizId }).lean();
    return bookmark ? this.mapToEntity(bookmark) : null;
  }

  async deleteByUserAndQuiz(userId: string, quizId: string): Promise<void> {
    const result = await this.bookmarkModel.findOneAndDelete({ userId, quizId });
    if (!result) {
      throw new NotFoundError('Bookmark not found');
    }
  }

  private mapToEntity(doc: any): Bookmark {
    return {
      id: doc._id?.toString() || doc.id,
      userId: doc.userId,
      quizId: doc.quizId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
