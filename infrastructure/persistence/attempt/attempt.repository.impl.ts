import { Model } from 'mongoose';
import { IAttemptRepository } from '@/core/attempt/attempt.repository';
import { Attempt } from '@/core/attempt/attempt.entity';
import { NotFoundError } from '@/core/shared/errors/not-found-error';

export class AttemptRepository implements IAttemptRepository {
  constructor(private attemptModel: Model<any>) {}

  async create(data: Partial<Attempt>): Promise<Attempt> {
    const attempt = new this.attemptModel(data);
    await attempt.save();
    return this.mapToEntity(attempt);
  }

  async findById(id: string): Promise<Attempt | null> {
    const attempt = await this.attemptModel.findById(id).lean();
    return attempt ? this.mapToEntity(attempt) : null;
  }

  async update(id: string, data: Partial<Attempt>): Promise<Attempt> {
    const attempt = await this.attemptModel.findByIdAndUpdate(
      id,
      { $set: data, updatedAt: new Date() },
      { new: true }
    );

    if (!attempt) {
      throw new NotFoundError('Attempt not found');
    }

    return this.mapToEntity(attempt);
  }

  async delete(id: string): Promise<void> {
    const result = await this.attemptModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('Attempt not found');
    }
  }

  async findByUserId(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ items: Attempt[]; total: number }> {
    const skip = (page - 1) * limit;
    const [attempts, total] = await Promise.all([
      this.attemptModel
        .find({ userId })
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.attemptModel.countDocuments({ userId }),
    ]);

    return {
      items: attempts.map((attempt) => this.mapToEntity(attempt)),
      total,
    };
  }

  async findByQuizId(
    quizId: string,
    page: number,
    limit: number
  ): Promise<{ items: Attempt[]; total: number }> {
    const skip = (page - 1) * limit;
    const [attempts, total] = await Promise.all([
      this.attemptModel
        .find({ quizId })
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.attemptModel.countDocuments({ quizId }),
    ]);

    return {
      items: attempts.map((attempt) => this.mapToEntity(attempt)),
      total,
    };
  }

  async findByUserAndQuiz(userId: string, quizId: string): Promise<Attempt[]> {
    const attempts = await this.attemptModel
      .find({ userId, quizId })
      .sort({ submittedAt: -1 })
      .lean();
    return attempts.map((attempt) => this.mapToEntity(attempt));
  }

  async countAttemptsByUserAndQuiz(userId: string, quizId: string): Promise<number> {
    return await this.attemptModel.countDocuments({ userId, quizId });
  }

  private mapToEntity(doc: any): Attempt {
    return {
      id: doc._id?.toString() || doc.id,
      userId: doc.userId,
      quizId: doc.quizId,
      answers: doc.answers || [],
      totalScore: doc.totalScore,
      passed: doc.passed,
      timeSpent: doc.timeSpent,
      startedAt: doc.startedAt,
      submittedAt: doc.submittedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
