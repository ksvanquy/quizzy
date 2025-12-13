/**
 * API Client Services
 * High-level client services for domain operations
 */

import { HttpClient } from './http-client';

// Initialize base HTTP client
export const apiClient = new HttpClient(
  process.env.NEXT_PUBLIC_API_URL || '/api'
);

/**
 * User API Service
 */
export const userApi = {
  /**
   * Get current user profile
   */
  getProfile: async () => {
    return apiClient.get('/user/profile');
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: any) => {
    return apiClient.put('/user/profile', data);
  },

  /**
   * Change password
   */
  changePassword: async (data: { oldPassword: string; newPassword: string }) => {
    return apiClient.post('/user/password', data);
  },
};

/**
 * Category API Service
 */
export const categoryApi = {
  /**
   * Get all categories
   */
  getCategories: async (params?: { page?: number; limit?: number }) => {
    return apiClient.get('/categories', { params });
  },

  /**
   * Get category by ID
   */
  getCategory: async (id: string) => {
    return apiClient.get(`/categories/${id}`);
  },

  /**
   * Get category by slug
   */
  getCategoryBySlug: async (slug: string) => {
    return apiClient.get(`/categories/slug/${slug}`);
  },
};

/**
 * Quiz API Service
 */
export const quizApi = {
  /**
   * Get all quizzes
   */
  getQuizzes: async (params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
  }) => {
    return apiClient.get('/quizzes', { params });
  },

  /**
   * Get quiz by ID
   */
  getQuiz: async (id: string) => {
    return apiClient.get(`/quizzes/${id}`);
  },

  /**
   * Get quiz details with questions
   */
  getQuizDetails: async (id: string) => {
    return apiClient.get(`/quizzes/${id}/details`);
  },
};

/**
 * Question API Service
 */
export const questionApi = {
  /**
   * Get questions for a quiz
   */
  getQuestionsForQuiz: async (quizId: string, params?: {
    page?: number;
    limit?: number;
  }) => {
    return apiClient.get(`/questions?quizId=${quizId}`, { params });
  },

  /**
   * Get question by ID
   */
  getQuestion: async (id: string) => {
    return apiClient.get(`/questions/${id}`);
  },

  /**
   * Get next question in quiz
   */
  getNextQuestion: async (quizId: string, currentIndex: number) => {
    return apiClient.get(`/questions/next?quizId=${quizId}&index=${currentIndex}`);
  },
};

/**
 * Attempt API Service
 */
export const attemptApi = {
  /**
   * Create new quiz attempt
   */
  createAttempt: async (data: { quizId: string; userId: string }) => {
    return apiClient.post('/attempts', data);
  },

  /**
   * Get attempt by ID
   */
  getAttempt: async (id: string) => {
    return apiClient.get(`/attempts/${id}`);
  },

  /**
   * Submit answer to attempt
   */
  submitAnswer: async (attemptId: string, data: any) => {
    return apiClient.post(`/attempts/${attemptId}/answers`, data);
  },

  /**
   * Complete attempt
   */
  completeAttempt: async (id: string) => {
    return apiClient.put(`/attempts/${id}/complete`, {});
  },

  /**
   * Get user attempts
   */
  getUserAttempts: async (params?: { page?: number; limit?: number }) => {
    return apiClient.get('/attempts', { params });
  },
};

/**
 * Bookmark API Service
 */
export const bookmarkApi = {
  /**
   * Get user bookmarks
   */
  getBookmarks: async (params?: { page?: number; limit?: number }) => {
    return apiClient.get('/bookmarks', { params });
  },

  /**
   * Add bookmark
   */
  addBookmark: async (data: { quizId: string; questionId?: string }) => {
    return apiClient.post('/bookmarks', data);
  },

  /**
   * Remove bookmark
   */
  removeBookmark: async (id: string) => {
    return apiClient.delete(`/bookmarks/${id}`);
  },

  /**
   * Check if bookmarked
   */
  isBookmarked: async (quizId: string, questionId?: string) => {
    return apiClient.get('/bookmarks/check', {
      params: { quizId, questionId },
    });
  },
};

/**
 * Watchlist API Service
 */
export const watchlistApi = {
  /**
   * Get user watchlist
   */
  getWatchlist: async (params?: { page?: number; limit?: number }) => {
    return apiClient.get('/watchlist', { params });
  },

  /**
   * Add to watchlist
   */
  addToWatchlist: async (data: { quizId: string }) => {
    return apiClient.post('/watchlist', data);
  },

  /**
   * Remove from watchlist
   */
  removeFromWatchlist: async (id: string) => {
    return apiClient.delete(`/watchlist/${id}`);
  },
};

/**
 * Result API Service
 */
export const resultApi = {
  /**
   * Get attempt result
   */
  getResult: async (attemptId: string) => {
    return apiClient.get(`/results/${attemptId}`);
  },

  /**
   * Get user results
   */
  getUserResults: async (params?: { page?: number; limit?: number }) => {
    return apiClient.get('/results', { params });
  },

  /**
   * Get quiz statistics
   */
  getQuizStats: async (quizId: string) => {
    return apiClient.get(`/results/quiz/${quizId}/stats`);
  },
};

/**
 * Auth API Service
 */
export const authApi = {
  /**
   * Register new user
   */
  register: async (data: { email: string; password: string; name: string }) => {
    return apiClient.post('/auth/register', data);
  },

  /**
   * Login user
   */
  login: async (data: { email: string; password: string }) => {
    return apiClient.post('/auth/login', data);
  },

  /**
   * Logout user
   */
  logout: async () => {
    return apiClient.post('/auth/logout', {});
  },

  /**
   * Refresh token
   */
  refreshToken: async (refreshToken: string) => {
    return apiClient.post('/auth/refresh', { refreshToken });
  },

  /**
   * Forgot password
   */
  forgotPassword: async (email: string) => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  /**
   * Reset password
   */
  resetPassword: async (token: string, password: string) => {
    return apiClient.post('/auth/reset-password', { token, password });
  },
};

// Export all services
export default {
  user: userApi,
  category: categoryApi,
  quiz: quizApi,
  question: questionApi,
  attempt: attemptApi,
  bookmark: bookmarkApi,
  watchlist: watchlistApi,
  result: resultApi,
  auth: authApi,
};
