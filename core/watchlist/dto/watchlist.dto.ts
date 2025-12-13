/**
 * Watchlist DTOs - Data Transfer Objects for watchlist operations
 */

// Watchlist Response DTO
export interface WatchlistResponseDto {
  id: string;
  userId: string;
  quizId: string;
  createdAt: Date;
}
