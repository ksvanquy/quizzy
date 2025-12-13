/**
 * Bookmark Entity - Domain model for user bookmarked quizzes
 */
export interface Bookmark {
  id: string;
  userId: string;
  quizId: string;
  createdAt: Date;
}

export class BookmarkEntity implements Bookmark {
  id: string;
  userId: string;
  quizId: string;
  createdAt: Date;

  constructor(data: Bookmark) {
    this.id = data.id;
    this.userId = data.userId;
    this.quizId = data.quizId;
    this.createdAt = data.createdAt;
  }
}
