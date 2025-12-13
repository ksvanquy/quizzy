import { Model } from 'mongoose';
import { IQuestionRepository } from '@/core/question/question.repository';
import { Question } from '@/core/question/question.entity';
import { NotFoundError } from '@/core/shared/errors/not-found-error';

export class QuestionRepository implements IQuestionRepository {
  constructor(private questionModel: Model<any>) {}

  async create(data: Partial<Question>): Promise<Question> {
    const question = new this.questionModel(data);
    await question.save();
    return this.mapToEntity(question);
  }

  async findById(id: string): Promise<Question | null> {
    const question = await this.questionModel.findById(id).lean();
    return question ? this.mapToEntity(question) : null;
  }

  async update(id: string, data: Partial<Question>): Promise<Question> {
    const question = await this.questionModel.findByIdAndUpdate(
      id,
      { $set: data, updatedAt: new Date() },
      { new: true }
    );

    if (!question) {
      throw new NotFoundError('Question not found');
    }

    return this.mapToEntity(question);
  }

  async delete(id: string): Promise<void> {
    const result = await this.questionModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('Question not found');
    }
  }

  async findAll(page: number, limit: number): Promise<{ items: Question[]; total: number }> {
    const skip = (page - 1) * limit;
    const [questions, total] = await Promise.all([
      this.questionModel.find().skip(skip).limit(limit).lean(),
      this.questionModel.countDocuments(),
    ]);

    return {
      items: questions.map((question) => this.mapToEntity(question)),
      total,
    };
  }

  async findByQuizId(quizId: string): Promise<Question[]> {
    const questions = await this.questionModel.find({ quizId }).lean();
    return questions.map((question) => this.mapToEntity(question));
  }

  async findByCategory(categoryId: string): Promise<Question[]> {
    const questions = await this.questionModel
      .find({ categoryIds: { $in: [categoryId] } })
      .lean();
    return questions.map((question) => this.mapToEntity(question));
  }

  async findByType(type: string): Promise<Question[]> {
    const questions = await this.questionModel.find({ type }).lean();
    return questions.map((question) => this.mapToEntity(question));
  }

  private mapToEntity(doc: any): Question {
    return {
      id: doc._id?.toString() || doc.id,
      text: doc.text,
      type: doc.type,
      difficulty: doc.difficulty,
      points: doc.points,
      explanation: doc.explanation,
      categoryIds: doc.categoryIds || [],
      tags: doc.tags || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      // Question type-specific fields (preserved as-is)
      ...(doc.type === 'single_choice' && {
        options: doc.options,
        correctOptionId: doc.correctOptionId,
      }),
      ...(doc.type === 'multiple_choice' && {
        options: doc.options,
        correctOptionIds: doc.correctOptionIds,
      }),
      ...(doc.type === 'fill_blank' && {
        blanks: doc.blanks,
        acceptPartialCredit: doc.acceptPartialCredit,
      }),
      ...(doc.type === 'cloze_test' && {
        passage: doc.passage,
        blanks: doc.blanks,
      }),
      ...(doc.type === 'numeric_input' && {
        correctAnswer: doc.correctAnswer,
        tolerance: doc.tolerance,
      }),
      ...(doc.type === 'ordering' && {
        items: doc.items,
        correctOrder: doc.correctOrder,
      }),
      ...(doc.type === 'matching' && {
        pairs: doc.pairs,
      }),
    };
  }
}
