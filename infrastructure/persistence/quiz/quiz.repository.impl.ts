import { Model } from 'mongoose';
import { IQuizRepository } from '@/core/quiz/quiz.repository';
import { Quiz } from '@/core/quiz/quiz.entity';
import { NotFoundError } from '@/core/shared/errors/not-found-error';
import { ConflictError } from '@/core/shared/errors/conflict-error';

export class QuizRepository implements IQuizRepository {
  constructor(private quizModel: Model<any>) {}

  async create(data: Partial<Quiz>): Promise<Quiz> {
    // Check if slug already exists
    const existingQuiz = await this.quizModel.findOne({ slug: data.slug });
    if (existingQuiz) {
      throw new ConflictError('Quiz slug already exists');
    }

    const quiz = new this.quizModel(data);
    await quiz.save();
    return this.mapToEntity(quiz);
  }

  async findById(id: string): Promise<Quiz | null> {
    const quiz = await this.quizModel.findById(id).lean();
    return quiz ? this.mapToEntity(quiz) : null;
  }

  async findBySlug(slug: string): Promise<Quiz | null> {
    const quiz = await this.quizModel.findOne({ slug }).lean();
    return quiz ? this.mapToEntity(quiz) : null;
  }

  async update(id: string, data: Partial<Quiz>): Promise<Quiz> {
    // Check if slug is being updated and if it already exists
    if (data.slug) {
      const existingQuiz = await this.quizModel.findOne({
        slug: data.slug,
        _id: { $ne: id },
      });
      if (existingQuiz) {
        throw new ConflictError('Quiz slug already exists');
      }
    }

    const quiz = await this.quizModel.findByIdAndUpdate(
      id,
      { $set: data, updatedAt: new Date() },
      { new: true }
    );

    if (!quiz) {
      throw new NotFoundError('Quiz not found');
    }

    return this.mapToEntity(quiz);
  }

  async delete(id: string): Promise<void> {
    const result = await this.quizModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('Quiz not found');
    }
  }

  async findAll(page: number, limit: number): Promise<{ items: Quiz[]; total: number }> {
    const skip = (page - 1) * limit;
    const [quizzes, total] = await Promise.all([
      this.quizModel.find().skip(skip).limit(limit).lean(),
      this.quizModel.countDocuments(),
    ]);

    return {
      items: quizzes.map((quiz) => this.mapToEntity(quiz)),
      total,
    };
  }

  async findByCategory(
    categoryId: string,
    page: number,
    limit: number
  ): Promise<{ items: Quiz[]; total: number }> {
    const skip = (page - 1) * limit;
    const [quizzes, total] = await Promise.all([
      this.quizModel.find({ categoryId }).skip(skip).limit(limit).lean(),
      this.quizModel.countDocuments({ categoryId }),
    ]);

    return {
      items: quizzes.map((quiz) => this.mapToEntity(quiz)),
      total,
    };
  }

  async findByCreator(createdById: string): Promise<Quiz[]> {
    const quizzes = await this.quizModel.find({ createdById }).lean();
    return quizzes.map((quiz) => this.mapToEntity(quiz));
  }

  private mapToEntity(doc: any): Quiz {
    return {
      id: doc._id?.toString() || doc.id,
      title: doc.title,
      slug: doc.slug,
      description: doc.description,
      categoryId: doc.categoryId,
      createdById: doc.createdById,
      difficulty: doc.difficulty,
      duration: doc.duration,
      totalPoints: doc.totalPoints,
      passingScore: doc.passingScore,
      status: doc.status,
      maxAttempts: doc.maxAttempts,
      questionIds: doc.questionIds || [],
      shuffleQuestions: doc.shuffleQuestions,
      shuffleOptions: doc.shuffleOptions,
      revealAnswersAfterSubmission: doc.revealAnswersAfterSubmission,
      tags: doc.tags || [],
      totalAttempts: doc.totalAttempts,
      averageScore: doc.averageScore,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
