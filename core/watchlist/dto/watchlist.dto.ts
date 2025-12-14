/**
 * Watchlist DTOs - Data Transfer Objects for watchlist operations
 */

// Watchlist Response DTO
export interface WatchlistResponseDto {
  _id: string;
  userId: string;
  quizId: any; // Can be string or populated quiz object
  createdAt: Date;
}
