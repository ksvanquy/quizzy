# Phase 9: Client-side Setup - Implementation Guide

## Overview

Phase 9 implements comprehensive client-side utilities and services for the Quizzy application, including HTTP client, interceptors, API services, and React hooks.

---

## 📦 What Was Implemented

### 1. HTTP Client (`lib/client/http-client.ts`)
- Base HTTP client with fetch API
- Request/response interceptor support
- Automatic retry with exponential backoff
- Request timeout handling
- Query parameter serialization
- Error handling

**Features**:
- ✅ GET, POST, PUT, DELETE, PATCH methods
- ✅ Interceptor chain support
- ✅ Automatic retries (3 by default)
- ✅ Request timeout (30s default)
- ✅ Response type safety with TypeScript
- ✅ Query parameter handling

**Usage**:
```typescript
import { HttpClient } from '@/lib/client';

const client = new HttpClient('/api');

// Add interceptors
client.addRequestInterceptor((config) => {
  // Add auth header, logging, etc.
  return config;
});

// Make requests
const response = await client.get('/users');
const data = await client.post('/users', { name: 'John' });
```

### 2. Interceptors (`lib/client/interceptors.ts`)
Pre-built interceptors for common functionality:
- **Auth Interceptor** - Adds JWT token to requests
- **Request ID Interceptor** - Adds tracing ID
- **Retry Interceptor** - Handles request retries
- **Response Transformer** - Transforms response data
- **Error Transformer** - Standardizes error format
- **Request Logging** - Development logging
- **Response Logging** - Response logging
- **Rate Limiting** - Prevents too many concurrent requests
- **Offline Detection** - Queues requests when offline
- **Token Refresh** - Auto-refreshes expired tokens

**Usage**:
```typescript
import { createAuthInterceptor, createRequestIdInterceptor } from '@/lib/client';

client.addRequestInterceptor(createAuthInterceptor(() => getToken()));
client.addRequestInterceptor(createRequestIdInterceptor());
```

### 3. API Services (`lib/client/api-services.ts`)
Domain-specific API services:
- **userApi** - User profile and authentication
- **categoryApi** - Quiz categories
- **quizApi** - Quiz management
- **questionApi** - Questions
- **attemptApi** - Quiz attempts
- **bookmarkApi** - Bookmarks
- **watchlistApi** - Watchlist
- **resultApi** - Quiz results
- **authApi** - Authentication

**Usage**:
```typescript
import { quizApi, userApi } from '@/lib/client';

// Get quiz details
const quiz = await quizApi.getQuiz('quiz-123');

// Get user profile
const profile = await userApi.getProfile();
```

### 4. React Hooks (`lib/client/hooks.ts`)
Custom hooks for data fetching and mutations:
- **useAsyncData** - Generic data fetching hook
- **useMutation** - Mutation operations hook
- **useQuizDetails** - Quiz details with questions
- **useQuizQuestions** - Questions for quiz
- **useAttempt** - Quiz attempt data
- **useUserResults** - User quiz results
- **useBookmarks** - User bookmarks
- **useWatchlist** - User watchlist
- **useSubmitAnswer** - Submit quiz answer
- **useCreateAttempt** - Create new attempt
- **useToggleBookmark** - Toggle bookmark
- **useCompleteAttempt** - Complete attempt

**Usage**:
```typescript
import { useQuizDetails, useMutation } from '@/lib/client';

// Fetching data
const { data: quiz, loading, error } = useQuizDetails('quiz-123');

// Mutations
const { mutate: submitAnswer, loading } = useMutation(
  (answer) => attemptApi.submitAnswer(attemptId, answer)
);

// Handle submit
submitAnswer({ questionId: '123', answer: 'A' });
```

### 5. Utilities (`lib/client/utils.ts`)
Client-side utility functions:
- **formatTime** - Format seconds to mm:ss or hh:mm:ss
- **calculateScorePercentage** - Calculate quiz score
- **getGrade** - Get letter grade from percentage
- **formatDate** - Format dates
- **debounce** - Debounce function calls
- **throttle** - Throttle function calls
- **isEmpty** - Check if value is empty
- **safeJsonParse** - Safe JSON parsing
- **retryWithBackoff** - Retry with exponential backoff
- **isValidEmail** - Email validation
- **sanitizeHtml** - HTML sanitization
- **copyToClipboard** - Copy text to clipboard
- **storage** - LocalStorage utilities
- **sessionStorage_** - SessionStorage utilities

**Usage**:
```typescript
import { formatTime, formatDate, storage, debounce } from '@/lib/client';

// Format time
console.log(formatTime(125)); // "02:05"

// Store data
storage.setItem('key', { data: 'value' });
const data = storage.getItem('key');

// Debounce search
const searchHandler = debounce((query) => {
  searchQuizzes(query);
}, 500);
```

---

## File Structure

```
lib/client/
├── http-client.ts          # Base HTTP client
├── interceptors.ts         # Request/response interceptors
├── api-services.ts         # Domain API services
├── hooks.ts                # React hooks
├── utils.ts                # Utility functions
└── index.ts                # Central exports
```

---

## Quick Start

### 1. Initialize API Client with Interceptors

```typescript
// In app initialization or main component
import { apiClient, createAuthInterceptor, createRequestIdInterceptor } from '@/lib/client';

// Add interceptors
apiClient.addRequestInterceptor(createRequestIdInterceptor());
apiClient.addRequestInterceptor(createAuthInterceptor(() => getStoredToken()));

// Development logging
if (process.env.NODE_ENV === 'development') {
  apiClient.addRequestInterceptor(createRequestLoggingInterceptor(true));
  apiClient.addResponseInterceptor(createResponseLoggingInterceptor(true));
}
```

### 2. Use API Services

```typescript
import { quizApi, categoryApi } from '@/lib/client';

// Get categories
const categories = await categoryApi.getCategories();

// Get quiz
const quiz = await quizApi.getQuiz('quiz-123');
```

### 3. Use React Hooks in Components

```typescript
'use client';

import { useQuizDetails, useMutation, formatDate } from '@/lib/client';

export function QuizDetail({ quizId }) {
  const { data: quiz, loading } = useQuizDetails(quizId);
  const { mutate: createAttempt } = useMutation(attemptApi.createAttempt);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{quiz.title}</h1>
      <p>Created: {formatDate(quiz.createdAt)}</p>
      <button onClick={() => createAttempt({ quizId })}>
        Start Quiz
      </button>
    </div>
  );
}
```

---

## API Services Reference

### User API
```typescript
import { userApi } from '@/lib/client';

await userApi.getProfile();           // Get current user
await userApi.updateProfile(data);    // Update profile
await userApi.changePassword(data);   // Change password
```

### Category API
```typescript
import { categoryApi } from '@/lib/client';

await categoryApi.getCategories();    // All categories
await categoryApi.getCategory(id);    // Single category
await categoryApi.getCategoryBySlug(slug);
```

### Quiz API
```typescript
import { quizApi } from '@/lib/client';

await quizApi.getQuizzes(params);     // All quizzes
await quizApi.getQuiz(id);            // Single quiz
await quizApi.getQuizDetails(id);     // With questions
```

### Question API
```typescript
import { questionApi } from '@/lib/client';

await questionApi.getQuestionsForQuiz(quizId, params);
await questionApi.getQuestion(id);
await questionApi.getNextQuestion(quizId, index);
```

### Attempt API
```typescript
import { attemptApi } from '@/lib/client';

await attemptApi.createAttempt(data);
await attemptApi.getAttempt(id);
await attemptApi.submitAnswer(attemptId, data);
await attemptApi.completeAttempt(id);
```

### Bookmark API
```typescript
import { bookmarkApi } from '@/lib/client';

await bookmarkApi.getBookmarks();
await bookmarkApi.addBookmark({ quizId });
await bookmarkApi.removeBookmark(id);
```

### Watchlist API
```typescript
import { watchlistApi } from '@/lib/client';

await watchlistApi.getWatchlist();
await watchlistApi.addToWatchlist({ quizId });
await watchlistApi.removeFromWatchlist(id);
```

### Result API
```typescript
import { resultApi } from '@/lib/client';

await resultApi.getResult(attemptId);
await resultApi.getUserResults();
await resultApi.getQuizStats(quizId);
```

### Auth API
```typescript
import { authApi } from '@/lib/client';

await authApi.register({ email, password, name });
await authApi.login({ email, password });
await authApi.logout();
await authApi.refreshToken(refreshToken);
```

---

## Hooks Reference

### useAsyncData
Generic hook for fetching data.

```typescript
const { data, loading, error, refetch } = useAsyncData(
  () => quizApi.getQuiz('123'),
  {
    onSuccess: (data) => console.log('Loaded', data),
    onError: (error) => console.log('Error', error),
  }
);
```

### useMutation
Hook for mutations (create, update, delete).

```typescript
const { data, loading, error, mutate } = useMutation(
  (payload) => quizApi.createQuiz(payload),
  { onSuccess: () => refetchQuizzes() }
);

// Call mutation
mutate({ title: 'New Quiz' });
```

### Domain-Specific Hooks

```typescript
// Quiz details with questions
const { data: quiz, loading } = useQuizDetails(quizId);

// Questions for quiz
const { data: questions } = useQuizQuestions(quizId);

// Quiz attempt
const { data: attempt } = useAttempt(attemptId);

// User results
const { data: results } = useUserResults({ page: 1, limit: 10 });

// Bookmarks
const { data: bookmarks } = useBookmarks();

// Watchlist
const { data: watchlist } = useWatchlist();

// Submit answer
const { mutate: submitAnswer } = useSubmitAnswer(attemptId);
submitAnswer({ questionId, answer });

// Create attempt
const { mutate: createAttempt } = useCreateAttempt();
createAttempt({ quizId, userId });

// Toggle bookmark
const { isBookmarked, toggle } = useToggleBookmark();
toggle(quizId);

// Complete attempt
const { mutate: completeAttempt } = useCompleteAttempt();
completeAttempt(attemptId);
```

---

## Utilities Reference

### Time & Date Formatting
```typescript
import { formatTime, formatDate } from '@/lib/client';

formatTime(125);                          // "02:05"
formatTime(3661);                         // "01:01:01"
formatDate('2024-01-15', 'DD/MM/YYYY');  // "15/01/2024"
```

### Scoring
```typescript
import { calculateScorePercentage, getGrade } from '@/lib/client';

const percentage = calculateScorePercentage(85, 100);  // 85
const grade = getGrade(85);                            // "B"
```

### Function Utilities
```typescript
import { debounce, throttle } from '@/lib/client';

const debouncedSearch = debounce((query) => {
  searchQuizzes(query);
}, 500);

const throttledScroll = throttle(() => {
  loadMore();
}, 1000);
```

### Validation & Parsing
```typescript
import { isValidEmail, safeJsonParse, isEmpty } from '@/lib/client';

isValidEmail('user@example.com');      // true
safeJsonParse('{"a": 1}', {});         // { a: 1 }
isEmpty('');                            // true
```

### Storage
```typescript
import { storage, sessionStorage_ } from '@/lib/client';

// LocalStorage
storage.setItem('token', token);
const token = storage.getItem('token');
storage.removeItem('token');

// SessionStorage
sessionStorage_.setItem('quiz', quizData);
const quiz = sessionStorage_.getItem('quiz');
```

### Clipboard
```typescript
import { copyToClipboard } from '@/lib/client';

const success = await copyToClipboard('Text to copy');
```

---

## Error Handling

All API calls follow standardized error handling:

```typescript
const { data, error } = await useAsyncData(
  () => quizApi.getQuiz('123')
);

if (error) {
  console.log('Error:', error.message);
}
```

Response format:
```typescript
interface ResponseData<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}
```

---

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_URL=/api
NODE_ENV=development
```

### HTTP Client Configuration
```typescript
const client = new HttpClient(
  process.env.NEXT_PUBLIC_API_URL || '/api'
);

// Customize timeout
const response = await client.get('/quiz', {
  timeout: 60000,
  retries: 5
});
```

---

## Best Practices

✅ **Use Hooks** - Use React hooks instead of direct API calls  
✅ **Handle Errors** - Always handle potential errors  
✅ **Loading State** - Show loading indicator during requests  
✅ **Debounce** - Debounce search and input handlers  
✅ **Cache** - Implement caching for repeated requests  
✅ **Interceptors** - Use interceptors for auth and logging  
✅ **Type Safety** - Leverage TypeScript for type safety  
✅ **Error Boundaries** - Wrap components in error boundaries  

---

## Integration with Existing Code

### Migration from Old Hooks
```typescript
// Old way
const data = await fetch('/api/quizzes/123');
const quiz = await data.json();

// New way
import { quizApi } from '@/lib/client';
const { data: quiz } = await quizApi.getQuiz('123');
```

### Component Example
```typescript
'use client';

import { useQuizDetails, useCreateAttempt, formatTime } from '@/lib/client';
import { useState } from 'react';

export function QuizPage({ quizId }) {
  const { data: quiz, loading } = useQuizDetails(quizId);
  const { mutate: createAttempt, loading: creating } = useCreateAttempt({
    onSuccess: (data) => router.push(`/attempt/${data.id}`)
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1>{quiz.title}</h1>
      <p>Duration: {formatTime(quiz.duration)}</p>
      <button 
        onClick={() => createAttempt({ quizId })}
        disabled={creating}
      >
        {creating ? 'Starting...' : 'Start Quiz'}
      </button>
    </div>
  );
}
```

---

## Next Steps

1. ✅ Implement client-side setup
2. ⏳ Update all components to use new hooks
3. ⏳ Add caching layer for performance
4. ⏳ Add offline support
5. ⏳ Performance optimization

---

**Status**: Phase 9 Complete  
**Quality**: Production-Ready  
**Documentation**: Complete  
**Examples**: Provided
