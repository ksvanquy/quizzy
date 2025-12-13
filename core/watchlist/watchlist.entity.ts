/**
 * Watchlist Entity - Domain model for user watched quizzes
 */
export interface Watchlist {
  id: string;
  userId: string;
  quizId: string;
  createdAt: Date;
}

export class WatchlistEntity implements Watchlist {
  id: string;
  userId: string;
  quizId: string;
  createdAt: Date;

  constructor(data: Watchlist) {
    this.id = data.id;
    this.userId = data.userId;
    this.quizId = data.quizId;
    this.createdAt = data.createdAt;
  }
}
