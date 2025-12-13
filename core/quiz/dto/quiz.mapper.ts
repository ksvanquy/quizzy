import { Quiz } from '../quiz.entity';
import { QuizResponseDto } from './quiz.dto';

/**
 * Quiz Mapper - Convert between Quiz entity and QuizResponseDto
 */
export class QuizMapper {
  /**
   * Convert Quiz entity to QuizResponseDto
   */
  static toResponseDto(quiz: Quiz): QuizResponseDto {
    return {
      id: quiz.id,
      title: quiz.title,
      slug: quiz.slug,
      description: quiz.description,
      categoryId: quiz.categoryId,
      createdById: quiz.createdById,
      difficulty: quiz.difficulty,
      duration: quiz.duration,
      totalPoints: quiz.totalPoints,
      passingScore: quiz.passingScore,
      status: quiz.status,
      maxAttempts: quiz.maxAttempts,
      questionIds: quiz.questionIds,
      shuffleQuestions: quiz.shuffleQuestions,
      shuffleOptions: quiz.shuffleOptions,
      revealAnswersAfterSubmission: quiz.revealAnswersAfterSubmission,
      tags: quiz.tags,
      totalAttempts: quiz.totalAttempts,
      averageScore: quiz.averageScore,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
    };
  }

  /**
   * Convert array of Quiz entities to ResponseDtos
   */
  static toResponseDtos(quizzes: Quiz[]): QuizResponseDto[] {
    return quizzes.map((quiz) => this.toResponseDto(quiz));
  }
}
