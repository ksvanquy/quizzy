/**
 * Bookmark DTOs - Data Transfer Objects for bookmark operations
 */

// Bookmark Response DTO
export interface BookmarkResponseDto {
  id: string;
  userId: string;
  quizId: string;
  createdAt: Date;
}
