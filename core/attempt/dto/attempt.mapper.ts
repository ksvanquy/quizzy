import { Attempt } from '../attempt.entity';
import { AttemptResponseDto, AttemptSummaryDto, AnswerResponseDto } from './attempt.dto';
import { AttemptService } from '../attempt.service';

/**
 * Attempt Mapper - Convert between Attempt entity and DTOs
 */
export class AttemptMapper {
  /**
   * Convert Attempt entity to AttemptResponseDto
   */
  static toResponseDto(attempt: Attempt): AttemptResponseDto {
    return {
      id: attempt.id,
      userId: attempt.userId,
      quizId: attempt.quizId,
      answers: attempt.answers.map((answer) => ({
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
        isCorrect: answer.isCorrect,
        pointsEarned: answer.pointsEarned,
      } as AnswerResponseDto)),
      totalScore: attempt.totalScore,
      passed: attempt.passed,
      timeSpent: attempt.timeSpent,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      createdAt: attempt.createdAt,
      updatedAt: attempt.updatedAt,
    };
  }

  /**
   * Convert Attempt entity to AttemptSummaryDto
   */
  static toSummaryDto(attempt: Attempt, totalPoints: number): AttemptSummaryDto {
    const service = new AttemptService(null as any);

    return {
      id: attempt.id,
      quizId: attempt.quizId,
      totalScore: attempt.totalScore,
      scorePercentage: service.getScorePercentage(attempt, totalPoints),
      passed: attempt.passed,
      correctCount: service.getCorrectAnswersCount(attempt),
      wrongCount: service.getWrongAnswersCount(attempt),
      accuracy: service.getAccuracyPercentage(attempt),
      timeSpent: attempt.timeSpent,
      duration: service.getFormattedDuration(attempt.timeSpent),
      submittedAt: attempt.submittedAt,
    };
  }

  /**
   * Convert array of Attempt entities to ResponseDtos
   */
  static toResponseDtos(attempts: Attempt[]): AttemptResponseDto[] {
    return attempts.map((attempt) => this.toResponseDto(attempt));
  }

  /**
   * Convert array of Attempt entities to SummaryDtos
   */
  static toSummaryDtos(attempts: Attempt[], totalPoints: number): AttemptSummaryDto[] {
    return attempts.map((attempt) => this.toSummaryDto(attempt, totalPoints));
  }
}
