import { Bookmark } from '../bookmark.entity';
import { BookmarkResponseDto } from './bookmark.dto';

/**
 * Bookmark Mapper - Convert between Bookmark entity and BookmarkResponseDto
 */
export class BookmarkMapper {
  /**
   * Convert Bookmark entity to BookmarkResponseDto
   */
  static toResponseDto(bookmark: Bookmark): BookmarkResponseDto {
    // Handle both populated and unpopulated quizId
    const quizId = typeof bookmark.quizId === 'object' ? bookmark.quizId : { _id: bookmark.quizId };
    
    return {
      _id: bookmark.id,
      userId: bookmark.userId,
      quizId: quizId,
      createdAt: bookmark.createdAt,
    };
  }

  /**
   * Convert array of Bookmark entities to ResponseDtos
   */
  static toResponseDtos(bookmarks: Bookmark[]): BookmarkResponseDto[] {
    return bookmarks.map((bookmark) => this.toResponseDto(bookmark));
  }
}
