# Clean Architecture 4-Layer cho Quizzy (Next.js Fullstack)

## 📋 TỔNG QUAN CẤU TRÚC HIỆN TẠI vs MỤC TIÊU

### Cấu Trúc Hiện Tại (Mixed Architecture)
```
app/
├── api/              ← API Routes (Controllers nhưng khó quản lý)
├── components/       ← UI Components
├── pages/           ← Pages
├── hooks/           ← Custom hooks (phân tán)
├── auth/            ← Auth pages
└── ...

lib/
├── models/          ← Mongoose Models (Models nhưng chỉ Schema)
├── utils/           ← Utilities (mixing concerns)
├── contexts/        ← Context API
├── hooks/           ← More hooks
└── db.ts
```

### Cấu Trúc Target - Clean Architecture 4 Layer (App Router) - ENTERPRISE READY
✅ Phase 0 & 1 Completed (11 + 30+ files created)
🔄 Working on Phase 2-13
```
app/                                    ← 1) PRESENTATION LAYER
├── layout.tsx                          ← Root layout
├── page.tsx                            ← Home page
├── error.tsx                           ← Error boundary
├── not-found.tsx                       ← 404 page
├── api/                                ← API Controllers (route.ts)
│   ├── middleware/                     ← API middleware
│   │   ├── auth-middleware.ts
│   │   └── error-handler.ts
│   ├── categories/
│   │   ├── route.ts                    # GET, POST
│   │   └── [id]/route.ts               # GET, PUT, DELETE
│   ├── quizzes/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── questions/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── attempts/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── bookmarks/route.ts
│   ├── watchlist/route.ts
│   └── auth/
│       ├── login/route.ts
│       ├── register/route.ts
│       └── profile/route.ts
├── (pages)/                            ← Pages (folder group, không ảnh hưởng routing)
│   ├── layout.tsx                      ← Pages layout
│   ├── quiz/
│   │   └── [id]/
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── result/[attemptId]/page.tsx
│   ├── history/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── bookmarks/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── watchlist/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── profile/
│       ├── layout.tsx
│       └── page.tsx
├── components/                         ← Reusable UI Components
│   ├── home/
│   ├── quiz/
│   ├── result/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ErrorBoundary.tsx           ← Error Boundary
│   └── providers/                      ← Context Providers
│       ├── AuthProvider.tsx
│       └── ToastProvider.tsx
└── globals.css

core/                                   ← 2) APPLICATION LAYER + 3) DOMAIN LAYER
├── user/
│   ├── user.entity.ts
│   ├── user.repository.ts
│   ├── user.service.ts
│   └── dto/
│       ├── create-user.dto.ts
│       ├── update-user.dto.ts
│       └── user-response.dto.ts
│
├── auth/
│   ├── auth.entity.ts
│   ├── auth.repository.ts
│   ├── auth.service.ts
│   └── dto/
│       ├── login.dto.ts
│       ├── register.dto.ts
│       └── auth-response.dto.ts
│
├── category/
│   ├── category.entity.ts
│   ├── category.repository.ts
│   ├── category.service.ts
│   └── dto/
│
├── quiz/
│   ├── quiz.entity.ts
│   ├── quiz.repository.ts
│   ├── quiz.service.ts
│   └── dto/
│
├── question/
│   ├── question.entity.ts
│   ├── question.repository.ts
│   ├── question.service.ts
│   └── dto/
│
├── attempt/
│   ├── attempt.entity.ts
│   ├── attempt.repository.ts
│   ├── attempt.service.ts
│   └── dto/
│
├── bookmark/
│   ├── bookmark.entity.ts
│   ├── bookmark.repository.ts
│   ├── bookmark.service.ts
│   └── dto/
│
├── watchlist/
│   ├── watchlist.entity.ts
│   ├── watchlist.repository.ts
│   ├── watchlist.service.ts
│   └── dto/
│
└── shared/                             ← Shared Domain Logic
    ├── errors/
    │   ├── domain-error.ts
    │   ├── validation-error.ts
    │   ├── not-found-error.ts
    │   ├── conflict-error.ts
    │   └── unauthorized-error.ts
    ├── types/
    │   ├── types.ts
    │   └── enums.ts
    ├── utils/
    │   └── scoring.ts
    └── validation/
        └── schemas.ts                  ← Zod/Yup schemas

infrastructure/                         ← 4) INFRASTRUCTURE LAYER
├── database/
│   ├── mongoose.ts
│   └── migrations/
│
├── persistence/
│   ├── user/
│   │   ├── user.schema.ts
│   │   └── user.repository.impl.ts
│   ├── category/
│   │   ├── category.schema.ts
│   │   └── category.repository.impl.ts
│   ├── quiz/
│   ├── question/
│   ├── attempt/
│   ├── bookmark/
│   └── watchlist/
│
└── external/
    ├── auth-provider/
    │   └── jwt-handler.ts
    └── email/
        └── email-service.ts            ← OPTIONAL: Email service

lib/                                    ← Utilities & Helpers
├── utils/
│   ├── api.ts                          ← API Response helpers
│   ├── jwt.ts                          ← JWT utilities
│   ├── password.ts                     ← Password hashing
│   ├── date.ts                         ← Date utilities
│   └── helpers.ts
│
├── client/
│   ├── api-client.ts                   ← HTTP client (axios/fetch)
│   ├── interceptors.ts                 ← Request/Response interceptors
│   └── error-handler.ts                ← Client error handling
│
├── logger/
│   ├── logger.ts                       ← Logging service
│   └── monitoring.ts                   ← Performance monitoring
│
├── guards/
│   └── auth.ts                         ← Auth validation
│
└── hooks/
    ├── useAuth.ts
    ├── useFetch.ts
    └── useAsync.ts

middleware.ts                            ← App Router middleware (Auth, logging)

config/                                  ← Configuration Management
├── env.ts                              ← Environment validation (Zod)
├── app.config.ts                       ← App configuration
└── constants.ts                        ← Application constants

constants/                               ← Global Constants & Enums
├── error-codes.ts
├── http-status.ts
├── app.constants.ts
└── error-messages.ts

types/                                   ← Global Types
├── index.ts
├── api.types.ts
└── domain.types.ts

styles/
└── globals.css
```

---

## 📑 CHECKLIST CHUẨN HÓA CLEAN ARCHITECTURE 4 LAYER (ENTERPRISE)

### ✅ Phase 0: Infrastructure & Config (COMPLETED ✓)
- [x] Setup environment validation (Zod) → `config/env.ts`
- [x] Create config management → `config/app.config.ts`
- [x] Setup global constants & enums → `constants/app.constants.ts`
- [x] Configure logging service → `lib/logger/logger.ts` + `lib/logger/monitoring.ts`
- [x] Setup error codes & messages → `constants/error-codes.ts` + `constants/error-messages.ts`
- [x] Add request/response types → `types/api.types.ts` + `types/domain.types.ts`
- [x] Add HTTP status codes → `constants/http-status.ts`
- [x] Install Zod dependency → `zod@^3.22.4` installed
- [x] Create PHASE_0_COMPLETE.md documentation
**Status: 100% COMPLETE** ✅

### ✅ Phase 1: Thiết Lập Cấu Trúc Thư Mục (Foundation) - COMPLETED ✅
- [x] Tạo `core/` với 7 entities (User, Category, Quiz, Question, Attempt, Bookmark, Watchlist)
- [x] Tạo `infrastructure/` với database & persistence folders
- [x] Tạo `core/shared/errors/` với 7 error classes (DomainError, ValidationError, NotFoundError, ConflictError, UnauthorizedError, ForbiddenError, InternalServerError)
- [x] Tạo `lib/client/` API client (api-client.ts, interceptors.ts, error-handler.ts)
- [x] Tạo `lib/guards/` auth utilities (withAuth, withRole, validateToken)
- [x] Tạo `middleware.ts` cho app middleware (auth & logging)
- [x] Tạo error boundaries & providers (ErrorBoundary.tsx, AuthProvider.tsx, ToastProvider.tsx)
**Status: 100% COMPLETE** ✅ | **Files Created**: 30+ files

### ✅ Phase 2: Services & Application Logic - COMPLETED ✅
- [x] UserService (CRUD, password change, role checks)
- [x] CategoryService (hierarchical categories, move, deactivate)
- [x] QuizService (publish, archive, question management)
- [x] QuestionService (8 question types, validation)
- [x] AttemptService (scoring, grading, statistics)
- [x] BookmarkService (bookmark/unbookmark quizzes)
- [x] WatchlistService (add/remove from watchlist)
- [x] AuthService (register, login, token refresh, password change)
**Status: 100% COMPLETE** ✅ | **Services Created**: 8 with 90+ methods

### ✅ Phase 3: DTOs & Validation - COMPLETED ✅
- [x] User DTOs (CreateUserDto, UpdateUserDto, UserResponseDto, ChangePasswordDto)
- [x] Category DTOs (CreateCategoryDto, UpdateCategoryDto, MoveCategoryDto, CategoryResponseDto)
- [x] Quiz DTOs (CreateQuizDto, UpdateQuizDto, AddQuestionDto, ReorderQuestionsDto, QuizResponseDto)
- [x] Question DTOs (8 types: SingleChoice, MultipleChoice, TrueFalse, FillBlank, CloseTest, NumericInput, Ordering, Matching)
- [x] Attempt DTOs (SubmitAnswerDto, SubmitAttemptDto, AttemptResponseDto, AttemptSummaryDto, AttemptStatisticsDto)
- [x] Bookmark DTOs (BookmarkResponseDto)
- [x] Watchlist DTOs (WatchlistResponseDto)
- [x] Auth DTOs (LoginDto, RegisterDto, AuthResponseDto, RefreshTokenDto, ChangePasswordAuthDto)
- [x] DTO Mappers (8 mappers: User, Category, Quiz, Question, Attempt, Bookmark, Watchlist, Auth)
- [x] Zod Validation Schemas (20+ schemas with comprehensive validation)
**Status: 100% COMPLETE** ✅ | **DTOs**: 30+ | **Schemas**: 20+

### ✅ Phase 4: Infrastructure Layer - Repository Implementations - COMPLETED ✅
- [x] User Repository Implementation (Mongoose) → `infrastructure/persistence/user/user.repository.impl.ts`
- [x] Category Repository Implementation → `infrastructure/persistence/category/category.repository.impl.ts`
- [x] Quiz Repository Implementation → `infrastructure/persistence/quiz/quiz.repository.impl.ts`
- [x] Question Repository Implementation → `infrastructure/persistence/question/question.repository.impl.ts`
- [x] Attempt Repository Implementation → `infrastructure/persistence/attempt/attempt.repository.impl.ts`
- [x] Bookmark Repository Implementation → `infrastructure/persistence/bookmark/bookmark.repository.impl.ts`
- [x] Watchlist Repository Implementation → `infrastructure/persistence/watchlist/watchlist.repository.impl.ts`
**Status: 100% COMPLETE** ✅ | **Repositories**: 7 with full Mongoose integration

### ✅ Phase 5: Infrastructure Layer - Schemas - COMPLETED ✅
- [x] User Schema → `infrastructure/persistence/user/user.schema.ts` with validation & indexes
- [x] Category Schema → `infrastructure/persistence/category/category.schema.ts` with circular reference prevention
- [x] Quiz Schema → `infrastructure/persistence/quiz/quiz.schema.ts` with category/creator references
- [x] Question Schema → `infrastructure/persistence/question/question.schema.ts` supporting 8 question types
- [x] Attempt Schema → `infrastructure/persistence/attempt/attempt.schema.ts` with answers array & scoring
- [x] Bookmark Schema → `infrastructure/persistence/bookmark/bookmark.schema.ts` with unique userId/quizId index
- [x] Watchlist Schema → `infrastructure/persistence/watchlist/watchlist.schema.ts` with unique userId/quizId index
- [x] Created `infrastructure/persistence/index.ts` exporting all schemas, models, and repositories
- [x] Created `infrastructure/persistence/database.ts` with MongoDB connection and repository initialization
**Status: 100% COMPLETE** ✅ | **Schemas**: 7 | **Indexes**: 20+ optimized for queries

### ✅ Phase 6: Controllers/API Routes Refactoring - COMPLETED ✅
- [x] Created `lib/api-response.ts` with standardized response handlers (success, error, validation, unauthorized, forbidden, not-found, conflict)
- [x] Refactored `app/api/auth/login/route.ts` with AuthService and DTOs
- [x] Refactored `app/api/auth/register/route.ts` with validation and error handling
- [x] Created `app/api/auth/refresh/route.ts` for token refresh
- [x] Created `app/api/categories/clean-route.ts` with GET all (paginated) and POST
- [x] Created `app/api/categories/[slug]/clean-route.ts` with GET one, PUT, DELETE
- [x] Created `app/api/quizzes/clean-route.ts` with GET all/by-category and POST
- [x] Created `app/api/quizzes/[id]/clean-route.ts` with GET one, PUT, DELETE
- [x] Created `app/api/questions/clean-route.ts` with GET all and POST (8 question types)
- [x] Created `app/api/questions/[id]/clean-route.ts` with GET one, PUT, DELETE
- [x] Created `app/api/attempts/clean-route.ts` with GET user attempts and pagination
- [x] Created `app/api/attempts/[id]/clean-route.ts` with GET attempt details with access control
- [x] Created `app/api/bookmarks/clean-route.ts` with GET user bookmarks and POST bookmark
- [x] Created `app/api/watchlist/clean-route.ts` with GET watchlist and POST to watchlist
- [x] All routes use standardized error handling with error codes and HTTP status codes
- [x] All routes validate input with Zod schemas
- [x] All routes use services for business logic
- [x] All routes use DTOs for request/response transformation
**Status: 100% COMPLETE** ✅ | **Routes Created**: 14+ with standardized responses and error handling

### ✅ Phase 7: Error Handling, Validation & Middleware - COMPLETED ✅
- [x] Domain errors already created in Phase 1 (DomainError, ValidationError, NotFoundError, ConflictError, UnauthorizedError, ForbiddenError, InternalServerError)
- [x] Created `lib/error-handler.ts` with GlobalErrorHandler for all error types (domain, validation, JWT, database, timeout)
- [x] Created `lib/error-handler.ts` with catchErrors wrapper for async handlers
- [x] Created `lib/request-logger.ts` for request/response logging with performance tracking
- [x] Created `lib/auth-middleware.ts` with withAuth, withRole, withOptionalAuth wrappers
- [x] Created `lib/input-sanitizer.ts` for XSS prevention and input cleaning
- [x] Created `lib/middleware-chain.ts` for composable middleware chains with createApiHandler
- [x] Created `lib/validation-helper.ts` with validateInput, validateBatch for Zod schemas
- [x] Created `lib/service-error-handler.ts` for service layer error handling, retries, backoff
- [x] ErrorBoundary component already exists in `app/components/common/ErrorBoundary.tsx`
- [x] Created `ERROR_HANDLING_GUIDE.md` with comprehensive usage examples
- [x] All validation schemas from Phase 3 are integrated and used in all endpoints (Phase 6)
**Status: 100% COMPLETE** ✅ | **Error Handling**: Global + domain + service layers covered | **Middleware**: 5+ utilities created | **Security**: XSS prevention, input sanitization implemented

### ✅ Phase 8: Logging & Monitoring
- [x] Setup logger service
- [x] Add request logging middleware
- [x] Add error logging with context
- [x] Setup performance monitoring
- [x] Configure external monitoring (optional)
- [x] Create performance monitor (`lib/performance-monitor.ts`)
- [x] Create metrics collector (`lib/metrics-collector.ts`)
- [x] Create structured logger (`lib/structured-logger.ts`)
- [x] Create error tracker (`lib/error-tracker.ts`)
- [x] Create health checker (`lib/health-checker.ts`)
- [x] Create monitoring dashboard (`lib/monitoring-dashboard.ts`)
- [x] Create monitoring middleware (`lib/monitoring-middleware.ts`)
- [x] Create health check endpoint (`app/api/health/route.ts`)
- [x] Create monitoring endpoint (`app/api/monitoring/route.ts`)
- [x] Create monitoring guide (`MONITORING_LOGGING_GUIDE.md`)

### ✅ Phase 9: Client-side Setup
- [x] Create API client (axios/fetch)
- [x] Setup request/response interceptors
- [x] Move client-side fetch logic vào `lib/client/`
- [x] Update hooks để sử dụng client API
- [x] Create HTTP client (`lib/client/http-client.ts`)
- [x] Create interceptors (`lib/client/interceptors.ts`)
- [x] Create API services (`lib/client/api-services.ts`)
- [x] Create React hooks (`lib/client/hooks.ts`)
- [x] Create utilities (`lib/client/utils.ts`)
- [x] Create client index (`lib/client/index.ts`)
- [x] Create Phase 9 documentation (`PHASE_9_GUIDE.md`)

### ✅ Phase 10: Integration Tests & Cleanup
- [x] Create auth integration tests (`__tests__/integration/auth.test.ts`)
- [x] Create quiz integration tests (`__tests__/integration/quiz.test.ts`)
- [x] Create bookmarks integration tests (`__tests__/integration/bookmarks.test.ts`)
- [x] Create E2E user journey tests (`__tests__/integration/e2e.test.ts`)
- [x] Configure Jest (`jest.config.js`)
- [x] Setup test environment (`__tests__/setup.ts`)
- [x] Create cleanup analysis script (`scripts/cleanup-analysis.js`)
- [x] Create Phase 10 guide (`PHASE_10_GUIDE.md`)
- [ ] Run all tests and verify passing
- [ ] Identify and remove old files
- [ ] Update imports across codebase
- [ ] Verify error handling in tests
- [ ] Calculate code coverage

### 📚 Phase 11: Documentation & Security
- [ ] Update README.md với kiến trúc mới
- [ ] Document các services và repositories
- [ ] Create API documentation
- [ ] Security checklist review
- [ ] Performance review

### 🚀 Phase 12: Deployment & Monitoring
- [ ] Test build process
- [ ] Performance testing
- [ ] Load testing
- [ ] Deploy to staging
- [ ] Deploy to production
- [ ] Monitor in production

---

## 📊 DEPENDENCY FLOW

```
PRESENTATION LAYER (app/)
       ↓
APPLICATION LAYER (core/*/service)
       ↓
DOMAIN LAYER (core/*/entity, repository interface, errors)
       ↓
INFRASTRUCTURE LAYER (infrastructure/persistence/repository.impl)
       ↓
DATABASE LAYER (Mongoose)
```

### Rules:
- ✅ Outer layers can depend on inner layers
- ❌ Inner layers CANNOT depend on outer layers
- ✅ Use Dependency Injection để decouple
- ✅ Use Repository Pattern để abstraction database

---

## 🎯 PRIORITY (High to Low)

1. **High**: Core directory + Entities + Repositories
2. **High**: Services (Use Cases)
3. **High**: Infrastructure Repositories Implementation
4. **Medium**: Controllers/API Routes refactoring
5. **Medium**: DTOs + Validation
6. **Low**: Error handling (có basic rồi)
7. **Low**: Documentation & cleanup

---

## 📝 NOTES

### Entities vs Models
- **Entities** (core/): Business objects, pure logic, NO database details
- **Models** (Mongoose): Database schema, used in repository.impl

### Services vs Controllers
- **Services**: Pure business logic, no HTTP knowledge
- **Controllers**: HTTP handlers, route to service, return responses

### Repositories
- **Interface** (core/): Define contract
- **Implementation** (infrastructure/): Use Mongoose

### DTO vs Entity
- **DTO**: Data transfer, validation, API response
- **Entity**: Domain model, business logic

---

## 🔍 ENTITIES VÀ DOMAIN MODELS

### 1. User Entity
**Core Domain**: Authentication, Authorization, Profile
- id: string
- username: string
- email: string
- password: string (hashed)
- name: string
- avatar?: string
- role: 'admin' | 'teacher' | 'student'
- bio?: string
- phone?: string
- address?: string
- isActive: boolean
- createdAt: Date
- updatedAt: Date

### 2. Category Entity
**Core Domain**: Quiz Organization
- id: string
- name: string
- slug: string
- description?: string
- icon?: string
- parentId?: string (null for root categories)
- displayOrder: number
- isActive: boolean

### 3. Quiz Entity
**Core Domain**: Quiz Management & Assessment
- id: string
- title: string
- slug: string
- description?: string
- categoryId: string
- createdById: string
- difficulty: 'easy' | 'medium' | 'hard'
- duration: number (minutes)
- totalPoints: number
- passingScore: number
- status: 'active' | 'draft' | 'archived'
- maxAttempts: number (0 = unlimited)
- questionIds: string[]
- shuffleQuestions: boolean
- shuffleOptions: boolean
- revealAnswersAfterSubmission: boolean
- tags: string[]
- totalAttempts: number
- averageScore: number
- createdAt: Date
- updatedAt: Date

### 4. Question Entity
**Core Domain**: Assessment Content
- id: string
- text: string
- type: string (single_choice | multiple_choice | true_false | fill_blank | cloze_test | numeric_input | ordering | matching)
- difficulty: string
- points: number
- explanation?: string
- categoryIds?: string[]
- tags?: string[]
- createdAt: Date
- updatedAt: Date

### 5. Attempt Entity
**Core Domain**: Quiz Submission & Scoring
- id: string
- userId: string
- quizId: string
- answers: Array<{
    questionId: string
    userAnswer: any
    isCorrect: boolean
    pointsEarned: number
  }>
- totalScore: number
- passed: boolean
- timeSpent: number (seconds)
- startedAt: Date
- submittedAt: Date

### 6. Bookmark Entity
**Core Domain**: User Preferences - Saved Quizzes
- id: string
- userId: string
- quizId: string
- createdAt: Date

### 7. Watchlist Entity
**Core Domain**: User Preferences - Watched Quizzes
- id: string
- userId: string
- quizId: string
- createdAt: Date

---

## 🚀 IMPLEMENTATION STEPS

### Step 1: Create Folder Structure
```bash
mkdir -p core/{user,auth,category,quiz,question,attempt,bookmark,watchlist,shared/{errors,types,utils}}
mkdir -p infrastructure/{database,persistence/{user,category,quiz,question,attempt,bookmark,watchlist},external}
mkdir -p lib/client
```

### Step 2: Create Base Classes & Interfaces
- Create `core/shared/domain-error.ts`
- Create `core/shared/validation-error.ts`
- Create `core/shared/types.ts`
- Create repository interfaces

### Step 3: Create Entities
- Each entity file: `core/{domain}/{entity}.entity.ts`
- Should be pure TypeScript classes/interfaces
- No dependencies on database/framework

### Step 4: Create Services
- Each service: `core/{domain}/{domain}.service.ts`
- Implement use cases
- Use dependency injection
- Handle business logic & validation

### Step 5: Create DTOs
- Request/Response DTOs
- Input validation
- Mapper functions

### Step 6: Create Repository Implementations
- Mongoose-based implementations
- In `infrastructure/persistence/`

### Step 7: Update Controllers/API Routes
- Keep lean and simple
- Delegate to services
- Handle HTTP concerns only

---

## 🔗 DEPENDENCY INJECTION

For Next.js, we can use simple factories or manual injection:

```typescript
// Example: Create service with injected repository
function createCategoryService(repo: CategoryRepository): CategoryService {
  return new CategoryService(repo);
}
```

No need for heavy DI containers in Next.js initially.

---

## 📚 REFERENCES

- Clean Architecture: A Craftsman's Guide to Software Structure and Design
- Repository Pattern
- Domain-Driven Design
- SOLID Principles

---

## 📅 TIMELINE

- **Phase 1-2**: 1-2 days (Setup + Entities)
- **Phase 3-4**: 2-3 days (Services + DTOs)
- **Phase 5-6**: 1-2 days (Infrastructure)
- **Phase 7-8**: 2-3 days (Controllers + Errors)
- **Phase 9-10**: 1-2 days (Client + Tests)
- **Phase 11-12**: 1-2 days (Documentation + Deployment)

**Total Estimated**: 8-14 days

---

## 📌 CURRENT PROJECT STATUS

**Frontend**: Next.js 16.0.7 (App Router) + React 19 + TypeScript 5
**Database**: MongoDB + Mongoose 8.20.1
**Authentication**: JWT (bcryptjs, jsonwebtoken)
**Styling**: Tailwind CSS 4

### Existing Files (App Router):
```
app/
├── layout.tsx                          # Root layout
├── page.tsx                            # Home page
├── api/                                # API Routes (route.ts)
│   ├── auth/
│   │   ├── login/route.ts
│   │   ├── register/route.ts
│   │   └── profile/route.ts
│   ├── categories/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── quizzes/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── questions/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── attempts/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── bookmarks/route.ts
│   └── watchlist/route.ts
├── (pages)/                            # Page group (không ảnh hưởng URL)
│   ├── quiz/[id]/page.tsx
│   ├── result/[attemptId]/page.tsx
│   ├── history/page.tsx
│   ├── bookmarks/page.tsx
│   ├── watchlist/page.tsx
│   ├── profile/page.tsx
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── components/                     # Shared UI components
│       ├── home/
│       ├── quiz/
│       └── common/
├── components/                         # UI Components
├── hooks/                              # Custom hooks
├── contexts/                           # AuthContext
└── globals.css

lib/
├── models/                             # Mongoose schemas (12 models)
├── utils/                              # api.ts, jwt.ts, password.ts, helpers.ts
├── contexts/                           # AuthContext
└── db.ts                               # MongoDB connection

seed.ts                                 # Data seeding script
```

### Key Entities to Migrate:
1. **User** - Authentication & Profile
2. **Category** - Quiz organization with parent/child
3. **Quiz** - Assessment container
4. **Question** - 7 types support
5. **Attempt** - Submission & scoring
6. **Bookmark** - User saved quizzes
7. **Watchlist** - User watched quizzes

---

---

## 🏢 ENTERPRISE BEST PRACTICES

### 1. Environment Configuration (Zod Validation)
```typescript
// config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  API_PORT: z.string().default('3000'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']),
});

export const env = envSchema.parse(process.env);
```

### 2. Error Handling (Custom Errors)
```typescript
// core/shared/errors/domain-error.ts
export abstract class DomainError extends Error {
  abstract code: string;
  abstract statusCode: number;
}

export class ValidationError extends DomainError {
  code = 'VALIDATION_ERROR';
  statusCode = 400;
}
```

### 3. Request/Response Interceptors
```typescript
// lib/client/interceptors.ts
export const requestInterceptor = (config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};
```

### 4. Logging & Monitoring
```typescript
// lib/logger/logger.ts
export class Logger {
  info(message: string, data?: any) { /* */ }
  error(message: string, error?: Error) { /* */ }
  debug(message: string, data?: any) { /* */ }
}
```

### 5. Middleware (Authentication, Logging)
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Auth check, logging, etc.
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/(pages)/:path*'],
};
```

### 6. API Response Standardization
```typescript
// lib/utils/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export const sendSuccess = <T>(data: T) => {
  return JsonResponse({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
};
```

### 7. Constants Management
```typescript
// constants/http-status.ts
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// constants/error-messages.ts
export const ERROR_MESSAGES = {
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid credentials',
  UNAUTHORIZED: 'Unauthorized access',
} as const;
```

### 8. Validation Schemas (Zod)
```typescript
// core/shared/validation/schemas.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

### 9. Guards & Decorators (Auth)
```typescript
// lib/guards/auth.ts
export async function withAuth(request, handler) {
  const token = getTokenFromRequest(request);
  const user = verifyToken(token);
  if (!user) throw new UnauthorizedError();
  return handler(request, user);
}
```

### 10. Error Boundaries (React)
```typescript
// app/components/common/ErrorBoundary.tsx
'use client';

export class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Log error, send to monitoring service
  }
  render() { /* */ }
}
```

---

## 🔐 SECURITY CHECKLIST

- [ ] Environment variables validated with Zod
- [ ] JWT tokens properly signed & verified
- [ ] Password hashing with bcrypt
- [ ] Rate limiting on auth endpoints
- [ ] CSRF protection (if needed)
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Mongoose default)
- [ ] XSS protection (React default)
- [ ] CORS configuration
- [ ] Sensitive data logging filtered

---

## 📊 LOGGING & MONITORING CHECKLIST

- [ ] Request logging middleware
- [ ] Error logging with stack traces
- [ ] Performance monitoring (response time)
- [ ] Database query logging
- [ ] Auth event logging (login, logout)
- [ ] Structured logging (JSON format)
- [ ] Log levels (debug, info, warn, error)
- [ ] External monitoring (Sentry, DataDog, etc.)

---

## 🧪 TESTING CHECKLIST

- [ ] Unit tests for services
- [ ] Integration tests for API routes
- [ ] E2E tests for user flows
- [ ] Mock repositories for testing
- [ ] Test coverage > 80%

---

## 🔀 APP ROUTER vs PAGES ROUTER

### Next.js 16 App Router (Your Project)
✅ File-based routing tự động
✅ `/app/api/categories/route.ts` → `GET /api/categories`
✅ `/app/quiz/[id]/page.tsx` → `/quiz/123`
✅ Layout nesting tự động
✅ Server Components mặc định

**Ưu điểm**:
- Folder groups: `(pages)` không ảnh hưởng URL
- Dễ organize code theo feature
- Server/Client components tối ưu
- Streaming & Suspense hỗ trợ

### API Routes in App Router
```
app/
├── api/
│   ├── categories/
│   │   ├── route.ts          # GET /api/categories, POST /api/categories
│   │   └── [id]/
│   │       └── route.ts      # GET /api/categories/123, PUT, DELETE
│   └── auth/
│       └── login/
│           └── route.ts      # POST /api/auth/login
```

**route.ts** = Handlers: `export async function GET()`, `POST()`, `PUT()`, `DELETE()`

### Page Routes in App Router
```
app/
├── (pages)/                  # Folder group - không tính vào URL
│   ├── quiz/
│   │   └── [id]/
│   │       ├── layout.tsx    # Layout for /quiz/[id]
│   │       └── page.tsx      # /quiz/123
│   ├── result/
│   │   └── [attemptId]/
│   │       └── page.tsx      # /result/456
│   └── history/
│       └── page.tsx          # /history
```

---

## 🎨 EXPECTED IMPROVEMENTS

After implementing Clean Architecture:
- ✅ Clear separation of concerns
- ✅ Easy to test business logic (services)
- ✅ Database-agnostic domain logic
- ✅ Easy to add new features
- ✅ Better code organization
- ✅ Reduced coupling
- ✅ Improved maintainability
