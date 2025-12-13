/**
 * Client module exports
 * Centralized export point for all client-side utilities
 */

// HTTP Client
export { HttpClient, type RequestConfig, type ResponseData } from './http-client';

// API Services
export { apiClient, userApi, categoryApi, quizApi, questionApi, attemptApi, bookmarkApi, watchlistApi, resultApi, authApi } from './api-services';

// Hooks
export {
  useAsyncData,
  useMutation,
  useQuizDetails,
  useQuizQuestions,
  useAttempt,
  useUserResults,
  useBookmarks,
  useWatchlist,
  useSubmitAnswer,
  useCreateAttempt,
  useToggleBookmark,
  useCompleteAttempt,
  type UseAsyncOptions,
} from './hooks';

// Utilities
export {
  formatTime,
  calculateScorePercentage,
  getGrade,
  formatDate,
  debounce,
  throttle,
  isEmpty,
  safeJsonParse,
  retryWithBackoff,
  isValidEmail,
  sanitizeHtml,
  copyToClipboard,
  storage,
  sessionStorage_,
} from './utils';
