/**
 * Bookmark DTOs - Data Transfer Objects for bookmark operations
 */

// Bookmark Response DTO
export interface BookmarkResponseDto {
  _id: string;
  userId: string;
  quizId: any; // Can be string or populated quiz object
  createdAt: Date;
}
