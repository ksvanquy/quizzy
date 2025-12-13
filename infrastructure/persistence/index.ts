// Export schemas
export { userSchema, UserModel } from './user/user.schema';
export type { IUserSchema } from './user/user.schema';

export { categorySchema, CategoryModel } from './category/category.schema';
export type { ICategorySchema } from './category/category.schema';

export { quizSchema, QuizModel } from './quiz/quiz.schema';
export type { IQuizSchema } from './quiz/quiz.schema';

export { questionSchema, QuestionModel } from './question/question.schema';
export type { IQuestionSchema } from './question/question.schema';

export { attemptSchema, AttemptModel } from './attempt/attempt.schema';
export type { IAttemptSchema, IAnswerSchema } from './attempt/attempt.schema';

export { bookmarkSchema, BookmarkModel } from './bookmark/bookmark.schema';
export type { IBookmarkSchema } from './bookmark/bookmark.schema';

export { watchlistSchema, WatchlistModel } from './watchlist/watchlist.schema';
export type { IWatchlistSchema } from './watchlist/watchlist.schema';

// Export repositories
export { UserRepository } from './user/user.repository.impl';
export { CategoryRepository } from './category/category.repository.impl';
export { QuizRepository } from './quiz/quiz.repository.impl';
export { QuestionRepository } from './question/question.repository.impl';
export { AttemptRepository } from './attempt/attempt.repository.impl';
export { BookmarkRepository } from './bookmark/bookmark.repository.impl';
export { WatchlistRepository } from './watchlist/watchlist.repository.impl';
