# Phase 10 Quick Reference - Integration Tests & Cleanup

## 🚀 Quick Start Commands

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- auth.test.ts
npm test -- quiz.test.ts
npm test -- bookmarks.test.ts
npm test -- e2e.test.ts

# Run with coverage
npm test -- --coverage

# Watch mode (development)
npm test -- --watch

# Run cleanup analysis
node scripts/cleanup-analysis.js

# Run test runner with guidance
node scripts/test-runner.js
```

---

## 📂 Phase 10 Files Reference

| File | Purpose | Lines | Status |
|------|---------|-------|--------|
| `__tests__/integration/auth.test.ts` | Auth flow tests | 150+ | ✅ |
| `__tests__/integration/quiz.test.ts` | Quiz flow tests | 250+ | ✅ |
| `__tests__/integration/bookmarks.test.ts` | Bookmarks tests | 150+ | ✅ |
| `__tests__/integration/e2e.test.ts` | E2E user journey | 300+ | ✅ |
| `jest.config.js` | Jest configuration | 35 | ✅ |
| `__tests__/setup.ts` | Test environment | 25 | ✅ |
| `scripts/cleanup-analysis.js` | Cleanup analysis | - | ✅ |
| `scripts/test-runner.js` | Test runner | - | ✅ |
| `PHASE_10_GUIDE.md` | Documentation | 600+ | ✅ |
| `PHASE_10_PARTIAL_STATUS.md` | Status report | - | ✅ |
| `PHASE_10_EXECUTION_SUMMARY.md` | Summary (this) | - | ✅ |

---

## 🧪 Test Structure

### Auth Tests
```typescript
describe('Authentication Flow', () => {
  describe('Registration', () => { /* ... */ })
  describe('Login', () => { /* ... */ })
  describe('User Profile', () => { /* ... */ })
  describe('Logout', () => { /* ... */ })
})
```

### Quiz Tests
```typescript
describe('Quiz and Questions Flow', () => {
  describe('Categories', () => { /* ... */ })
  describe('Quizzes', () => { /* ... */ })
  describe('Questions', () => { /* ... */ })
  describe('Attempts', () => { /* ... */ })
  describe('Results', () => { /* ... */ })
})
```

### Bookmarks Tests
```typescript
describe('Bookmarks and Watchlist Flow', () => {
  describe('Bookmarks', () => { /* ... */ })
  describe('Watchlist', () => { /* ... */ })
  describe('Combined Workflow', () => { /* ... */ })
})
```

### E2E Tests
```typescript
describe('Complete User Journey', () => {
  describe('1. User Registration and Authentication', () => { /* ... */ })
  describe('2. Browse Categories and Quizzes', () => { /* ... */ })
  describe('3. Take Quiz', () => { /* ... */ })
  describe('4. Submit Answers', () => { /* ... */ })
  describe('5. View Results', () => { /* ... */ })
  describe('6. Bookmark and Organize', () => { /* ... */ })
  describe('Error Handling in Journey', () => { /* ... */ })
})
```

---

## 📊 Test Coverage

| Suite | Tests | Coverage |
|-------|-------|----------|
| Auth | 8 | Registration, Login, Profile, Logout |
| Quiz | 15 | Categories, Quizzes, Questions, Attempts, Results |
| Bookmarks | 6 | Add, Check, Remove, List, Watchlist |
| E2E | 6+ | Full user journey with error handling |
| **Total** | **35+** | **All major workflows** |

---

## 🔧 API Services Used in Tests

```typescript
// From lib/client/api-services.ts
import {
  authApi,        // Register, login, logout
  userApi,        // Get profile, update profile
  categoryApi,    // Get categories
  quizApi,        // Get quizzes, details
  questionApi,    // Get questions by quiz
  attemptApi,     // Create, submit attempts
  resultApi,      // Get results
  bookmarkApi,    // Add, remove bookmarks
  watchlistApi,   // Add, remove watchlist
} from '@/lib/client';
```

---

## ✅ Cleanup Checklist

- [ ] Run all tests: `npm test`
- [ ] Generate coverage: `npm test -- --coverage`
- [ ] Run analysis: `node scripts/cleanup-analysis.js`
- [ ] Review old imports report
- [ ] Update imports in app/components/
- [ ] Update imports in app/auth/
- [ ] Update imports in app/quiz/
- [ ] Remove old API files from lib/
- [ ] Verify no errors: `npm run lint`
- [ ] Final test run: `npm test`

---

## 📝 Old Import Patterns to Replace

```typescript
// OLD → NEW
import { fetchQuizzes } from '@/lib/client/api'
  → import { quizApi } from '@/lib/client/api-services'

import { useQuiz } from '@/hooks/useQuiz'
  → import { useAsyncData } from '@/lib/client/hooks'

import { formatTime } from '@/utils/formatTime'
  → import { formatTime } from '@/lib/client/utils'
```

---

## 🎯 Files to Review for Cleanup

1. **Old API Files** (may exist):
   - `lib/client/api.ts`
   - `lib/client/api.old.ts`

2. **Old Hooks** (may exist):
   - `hooks/` directory
   - `lib/old-hooks/`

3. **Old Utils** (may exist):
   - `utils/` directory
   - `lib/old-utils/`

4. **Duplicate Implementations**:
   - Check for multiple HTTP clients
   - Check for duplicate error handlers
   - Look for duplicate hook logic

---

## 🚨 Common Issues & Quick Fixes

### "Cannot find module '@/lib/client/api'"
**Fix**: This file was replaced in Phase 9. Use `lib/client/api-services.ts`

### "TypeError: jest is not defined"
**Fix**: Ensure `jest.config.js` exists and `__tests__/setup.ts` is configured

### "Timeout of 5000ms exceeded"
**Fix**: Increase timeout in `__tests__/setup.ts`:
```javascript
jest.setTimeout(30000); // 30 seconds
```

### "Cannot find type definitions"
**Fix**: Install types:
```bash
npm install --save-dev @types/jest @types/node
```

---

## 📖 Documentation Files

1. **PHASE_10_GUIDE.md** (600+ lines)
   - Comprehensive guide with all details
   - Step-by-step cleanup instructions
   - Common issues and solutions

2. **PHASE_10_PARTIAL_STATUS.md**
   - Project overview and metrics
   - Phase breakdown
   - Technology stack

3. **PHASE_10_EXECUTION_SUMMARY.md**
   - Files created in Phase 10
   - Execution progress
   - Test coverage breakdown

---

## 🔄 Typical Workflow

### Day 1: Testing
```bash
# 1. Run all tests
npm test

# 2. Generate coverage report
npm test -- --coverage

# 3. Review results
# (Look for passing tests and >50% coverage)
```

### Day 2: Cleanup
```bash
# 1. Analyze codebase
node scripts/cleanup-analysis.js

# 2. Update imports
# Edit files listed in analysis report

# 3. Remove old files
# Delete files identified for removal

# 4. Verify cleanup
npm run lint
npm test
```

### Day 3: Final Verification
```bash
# 1. Run all checks
npm run lint
npm test
npm test -- --coverage

# 2. Verify no errors
# 3. Commit changes
# 4. Update project status
```

---

## 📞 Resources

- **Full Guide**: [PHASE_10_GUIDE.md](./PHASE_10_GUIDE.md)
- **Project Status**: [PHASE_10_PARTIAL_STATUS.md](./PHASE_10_PARTIAL_STATUS.md)
- **Architecture**: [clean_architecture_4_layer.md](./clean_architecture_4_layer.md)
- **Test Files**: `__tests__/integration/`
- **Scripts**: `scripts/cleanup-analysis.js`, `scripts/test-runner.js`

---

## 🎯 Next Phase

After Phase 10 completion (83%):
- **Phase 11**: Documentation & Security (API docs, security audit)
- **Phase 12**: Deployment & Monitoring (CI/CD, production)

---

**Phase 10 Progress**: 65% Complete  
**Project Status**: 83% Complete (10/12)  
**Target**: Complete Phase 10 this session
