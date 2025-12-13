import mongoose from 'mongoose';
import { logger } from '@/lib/logger/logger';
import { env } from '@/config/env';

// Import models
import { UserModel } from './user/user.schema';
import { CategoryModel } from './category/category.schema';
import { QuizModel } from './quiz/quiz.schema';
import { QuestionModel } from './question/question.schema';
import { AttemptModel } from './attempt/attempt.schema';
import { BookmarkModel } from './bookmark/bookmark.schema';
import { WatchlistModel } from './watchlist/watchlist.schema';

// Import repositories
import { UserRepository } from './user/user.repository.impl';
import { CategoryRepository } from './category/category.repository.impl';
import { QuizRepository } from './quiz/quiz.repository.impl';
import { QuestionRepository } from './question/question.repository.impl';
import { AttemptRepository } from './attempt/attempt.repository.impl';
import { BookmarkRepository } from './bookmark/bookmark.repository.impl';
import { WatchlistRepository } from './watchlist/watchlist.repository.impl';

// Singleton instances for repositories
let userRepository: UserRepository | null = null;
let categoryRepository: CategoryRepository | null = null;
let quizRepository: QuizRepository | null = null;
let questionRepository: QuestionRepository | null = null;
let attemptRepository: AttemptRepository | null = null;
let bookmarkRepository: BookmarkRepository | null = null;
let watchlistRepository: WatchlistRepository | null = null;

/**
 * Connect to MongoDB database
 */
export async function connectDatabase(): Promise<void> {
  try {
    if (mongoose.connection.readyState === 1) {
      logger.debug('Already connected to MongoDB');
      return;
    }

    await mongoose.connect(env.DATABASE_URL, {
      serverSelectionTimeoutMS: 5000,
    });

    logger.info('Connected to MongoDB successfully', { database: env.DATABASE_URL });

    // Initialize repositories after connection
    initializeRepositories();
  } catch (error) {
    logger.error('Failed to connect to MongoDB', error as Error);
    throw error;
  }
}

/**
 * Initialize all repositories (singleton pattern)
 */
function initializeRepositories(): void {
  userRepository = new UserRepository(UserModel);
  categoryRepository = new CategoryRepository(CategoryModel);
  quizRepository = new QuizRepository(QuizModel);
  questionRepository = new QuestionRepository(QuestionModel);
  attemptRepository = new AttemptRepository(AttemptModel);
  bookmarkRepository = new BookmarkRepository(BookmarkModel);
  watchlistRepository = new WatchlistRepository(WatchlistModel);
}

/**
 * Get repository instances
 */
export function getRepositories() {
  if (
    !userRepository ||
    !categoryRepository ||
    !quizRepository ||
    !questionRepository ||
    !attemptRepository ||
    !bookmarkRepository ||
    !watchlistRepository
  ) {
    throw new Error('Repositories not initialized. Call connectDatabase first.');
  }

  return {
    userRepository,
    categoryRepository,
    quizRepository,
    questionRepository,
    attemptRepository,
    bookmarkRepository,
    watchlistRepository,
  };
}

/**
 * Disconnect from MongoDB database
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error('Failed to disconnect from MongoDB', error as Error);
    throw error;
  }
}
