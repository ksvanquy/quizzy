import { Question } from '../question.entity';
import { QuestionResponseDto } from './question.dto';

/**
 * Question Mapper - Convert between Question entity and QuestionResponseDto
 */
export class QuestionMapper {
  /**
   * Convert Question entity to QuestionResponseDto
   */
  static toResponseDto(question: Question): QuestionResponseDto {
    const baseDto: QuestionResponseDto = {
      id: question.id,
      text: question.text,
      type: question.type,
      difficulty: question.difficulty,
      points: question.points,
      explanation: question.explanation,
      categoryIds: question.categoryIds,
      tags: question.tags,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };

    // Include type-specific fields
    return {
      ...baseDto,
      ...question,
    };
  }

  /**
   * Convert array of Question entities to ResponseDtos
   */
  static toResponseDtos(questions: Question[]): QuestionResponseDto[] {
    return questions.map((question) => this.toResponseDto(question));
  }
}
