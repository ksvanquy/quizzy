# 🎯 CHIẾN LƯỢC XÓA OLD FILES - Clean Architecture 4-Layer Cleanup

**Status**: Phase 10 Integration Tests Completed  
**Target**: 100% Clean Architecture 4-Layer  
**Approach**: Safe, Staged Deletion with Verification  
**Estimated Time**: 1-2 hours

---

## 📊 ANALYSIS: OLD FILES VÀ DUPLICATE IMPLEMENTATIONS

### 1️⃣ **TIER 1: CÓ THỂ XÓA NGAY (100% Safe)**

#### A. Old Hooks (Duplicate/Obsolete)
```
app/hooks/
├── useBookmarkWatchlist.ts  ❌ REMOVE
│   └─ Reason: Replaced by lib/client/hooks.ts (useBookmarks, useWatchlist)

lib/hooks/
├── useTimer.ts              ❌ REMOVE (Optional)
│   └─ Reason: Can be kept if used, or replaced by lib/client/utils.ts
```

**Status**: Safe to remove - All functionality in `lib/client/hooks.ts`

---

#### B. Old Models (Replaced by Infrastructure Layer)
```
lib/models/
├── User.ts                  ❌ REMOVE
├── Category.ts              ❌ REMOVE
├── Quiz.ts                  ❌ REMOVE
├── Question.ts              ❌ REMOVE
├── FillBlank.ts             ❌ REMOVE
├── Matching.ts              ❌ REMOVE
├── NumericInput.ts          ❌ REMOVE
├── Ordering.ts              ❌ REMOVE
├── Option.ts                ❌ REMOVE
├── Attempt.ts               ❌ REMOVE
├── Bookmark.ts              ❌ REMOVE
├── Watchlist.ts             ❌ REMOVE
├── index.ts                 ❌ REMOVE (if only exports old models)
└── __init__.ts              ❌ REMOVE

Reason: All models moved to infrastructure/persistence/{entity}/schema.ts
```

**Replacement**: `infrastructure/persistence/{entity}/{entity}.schema.ts`

**Status**: Safe to remove - Infrastructure layer has all schemas

---

#### C. Old Utilities/Contexts
```
lib/contexts/
├── AuthContext.tsx          ⚠️ CONDITIONAL
│   └─ Use: Check if still used in app/components/
│   └─ If NOT used → REMOVE
│   └─ If used → KEEP (for now, migrate later)

lib/utils/
├── jwt.ts                   ⚠️ KEEP (Server-side JWT handling)
├── password.ts              ✅ KEEP (Password hashing)
├── helpers.ts               ⚠️ CHECK (Review what's in it)
```

**Status**: Need review before removal

---

### 2️⃣ **TIER 2: CÓ THỂ XÓA NHƯNG CẦN KIỂM TRA (Safe with Verification)**

#### D. Old API Routes (Pre-refactored versions)
```
app/api/
├── categories/
│   ├── route.ts             ✅ KEEP (Already refactored)
│   └── [id]/route.ts        ✅ KEEP (Already refactored)

├── quizzes/
│   ├── route.ts             ✅ KEEP (Already refactored)
│   └── [id]/route.ts        ✅ KEEP (Already refactored)

├── questions/
│   ├── route.ts             ✅ KEEP (Already refactored)
│   └── [id]/route.ts        ✅ KEEP (Already refactored)

├── attempts/
│   ├── route.ts             ✅ KEEP (Already refactored)
│   └── [id]/route.ts        ✅ KEEP (Already refactored)

├── bookmarks/
│   └── route.ts             ✅ KEEP (Already refactored)

├── watchlist/
│   └── route.ts             ✅ KEEP (Already refactored)

└── auth/
    ├── login/route.ts       ✅ KEEP (Already refactored)
    ├── register/route.ts    ✅ KEEP (Already refactored)
    └── refresh/route.ts     ✅ KEEP (Already refactored)
```

**Status**: All already clean - No cleanup needed here

---

#### E. Old Page Routes (Existing pages - Keep but Clean Up)
```
app/
├── auth/                    ✅ KEEP (Needed for UI)
├── quiz/                    ✅ KEEP (Needed for UI)
├── result/                  ✅ KEEP (Needed for UI)
├── quizzes/                 ⚠️ CHECK (Maybe duplicate with /)
├── bookmarks/               ✅ KEEP (Needed for UI)
├── watchlist/               ✅ KEEP (Needed for UI)
├── history/                 ✅ KEEP (Needed for UI)
├── profile/                 ✅ KEEP (Needed for UI)
└── components/              ✅ KEEP (Keep organized)
```

**Status**: Keep pages but could reorganize under `(pages)/` group

---

### 3️⃣ **TIER 3: KHÔNG XÓA (Critical Core Files)**

#### F. Core Clean Architecture Files (KEEP ✅)
```
core/                       ✅ KEEP (Domain Layer)
├── user/
├── auth/
├── category/
├── quiz/
├── question/
├── attempt/
├── bookmark/
└── watchlist/

infrastructure/             ✅ KEEP (Infrastructure Layer)
├── persistence/
├── database/
└── external/

lib/client/                 ✅ KEEP (Client Layer - Phase 9)
├── http-client.ts
├── interceptors.ts
├── api-services.ts
├── hooks.ts
├── utils.ts
└── index.ts

lib/server/                 ✅ KEEP (Server utilities)
lib/logger/                 ✅ KEEP (Logging/Monitoring)
lib/guards/                 ✅ KEEP (Auth guards)

config/                     ✅ KEEP (Configuration)
constants/                  ✅ KEEP (Constants)
types/                      ✅ KEEP (Types)
```

**Status**: All production-ready - No cleanup needed

---

## 🗑️ PHASE 1: TIER 1 DELETION (100% Safe)

### Step 1: Backup & Git Commit
```bash
# 1. Ensure all changes committed
git status
git add .
git commit -m "Phase 10: Before cleanup - checkpoint"

# 2. Create backup branch
git branch backup/before-cleanup
```

### Step 2: Remove Old Models
```bash
# Remove old Mongoose models (replaced by infrastructure/)
rm -rf lib/models/

# They're completely replaced by:
# - infrastructure/persistence/*/schema.ts
# - infrastructure/persistence/*/repository.impl.ts

# Verify no imports remain
grep -r "from.*lib/models" app/ lib/ core/
# Expected output: (empty)
```

### Step 3: Remove Old Hooks
```bash
# Remove app-level old hooks
rm app/hooks/useBookmarkWatchlist.ts

# lib/hooks/useTimer.ts - check first
grep -r "useTimer" app/ lib/
# If no usage found, remove:
# rm lib/hooks/useTimer.ts
```

### Step 4: Verify Imports After Deletion
```bash
# Check for broken imports
npm run lint
npm run type-check

# All should pass - if not, fix imports
```

---

## ⚠️ PHASE 2: TIER 2 DELETION (Safe with Verification)

### Step 1: Check AuthContext Usage
```bash
# Find all usages
grep -r "AuthContext\|useAuth" app/ lib/ --include="*.ts*"

# If results found:
# - Option A: Keep it (some old components might use it)
# - Option B: Migrate all components to use lib/client/hooks
# - Option C: Deprecate and mark as "to be removed"
```

### Step 2: Review lib/utils/helpers.ts
```bash
# Check what utilities are in helpers.ts
cat lib/utils/helpers.ts

# If functions are duplicated in lib/client/utils.ts:
# - Remove helpers.ts
# - Update imports to lib/client/utils

# If functions are unique/server-side only:
# - KEEP helpers.ts
```

### Step 3: Safe Removal (If Applicable)
```bash
# Only if verified no usage:
# rm lib/contexts/AuthContext.tsx  (if not used)
# rm lib/utils/helpers.ts           (if duplicated)
```

---

## 📋 PHASE 3: REORGANIZATION (Structure Optimization)

### Option 1: Organize Pages Under Route Group
```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── layout.tsx
│
├── (quiz)/
│   ├── quiz/[id]/page.tsx
│   ├── result/[attemptId]/page.tsx
│   └── layout.tsx
│
├── (user)/
│   ├── profile/page.tsx
│   ├── history/page.tsx
│   ├── bookmarks/page.tsx
│   ├── watchlist/page.tsx
│   └── layout.tsx
│
└── page.tsx (home)
```

**Benefit**: Better organization, shared layouts

---

### Option 2: Consolidate Components
```
app/components/
├── common/              (Already exists)
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ErrorBoundary.tsx
│
├── auth/
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
│
├── quiz/
│   ├── QuizCard.tsx
│   ├── QuestionRenderer.tsx
│   └── QuizTabs.tsx
│
├── result/
│   └── ResultDisplay.tsx
│
└── providers/           (Already exists)
    ├── AuthProvider.tsx
    └── ToastProvider.tsx
```

**Current**: Some organization already exists, enhance as needed

---

## ✅ VERIFICATION CHECKLIST

### After Each Phase

```bash
# Type checking
npx tsc --noEmit
# Expected: ✓ No errors

# Linting
npm run lint
# Expected: ✓ No errors

# Testing
npm test
# Expected: ✓ All tests passing

# Imports verification
grep -r "lib/models" app/ lib/ core/      # Should be empty
grep -r "hooks/useBookmark" app/          # Should be empty
grep -r "@/utils/" app/                   # Should use lib/client/utils

# Build test
npm run build
# Expected: ✓ Build successful
```

---

## 🎯 SAFE REMOVAL ORDER (Priority)

### ✅ Day 1 - Tier 1 (Absolutely Safe)
1. Remove `lib/models/` entire directory
2. Remove `app/hooks/useBookmarkWatchlist.ts`
3. Verify: `npm run lint && npm test`

### ⚠️ Day 2 - Tier 2 (After Verification)
1. Check `lib/contexts/AuthContext.tsx` usage
2. Check `lib/utils/helpers.ts` duplication
3. Remove if safe
4. Verify: `npm run lint && npm test`

### 🏗️ Day 3 - Reorganization (Optional)
1. Reorganize pages under route groups
2. Enhance component structure
3. Verify: `npm run lint && npm test && npm run build`

---

## 🔄 BACKUP & RECOVERY

```bash
# If something breaks:
git checkout backup/before-cleanup

# Or specific files:
git checkout backup/before-cleanup -- lib/models/
```

---

## 📊 FINAL ARCHITECTURE (After Cleanup)

```
quizzy/
├── __tests__/                       ← Integration tests (Phase 10)
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── quiz.test.ts
│   │   ├── bookmarks.test.ts
│   │   └── e2e.test.ts
│   └── setup.ts
│
├── app/                             ← PRESENTATION LAYER
│   ├── api/                         (API Routes - Clean)
│   ├── (auth)/                      (Auth pages)
│   ├── (quiz)/                      (Quiz pages)
│   ├── (user)/                      (User pages)
│   ├── components/                  (UI Components)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── core/                            ← DOMAIN LAYER
│   ├── user/
│   ├── auth/
│   ├── category/
│   ├── quiz/
│   ├── question/
│   ├── attempt/
│   ├── bookmark/
│   ├── watchlist/
│   └── shared/
│
├── infrastructure/                  ← INFRASTRUCTURE LAYER
│   ├── persistence/
│   └── database/
│
├── lib/
│   ├── client/                      ← CLIENT LAYER (Phase 9)
│   │   ├── http-client.ts
│   │   ├── interceptors.ts
│   │   ├── api-services.ts
│   │   ├── hooks.ts
│   │   ├── utils.ts
│   │   └── index.ts
│   ├── server/                      (Server utilities)
│   ├── logger/                      (Logging)
│   ├── guards/                      (Auth guards)
│   ├── utils/                       (Server utils)
│   └── ...
│
├── config/                          ← CONFIGURATION
├── constants/                       ← CONSTANTS
├── types/                           ← TYPES
├── middleware.ts
├── jest.config.js
├── package.json
└── ...

✨ CLEAN ARCHITECTURE 4-LAYER ✨
```

---

## 📈 Expected Results

### Before Cleanup
- 130+ files (includes old/duplicate)
- Mixed responsibilities
- Multiple import paths
- Some unused code

### After Cleanup
- 110+ files (only production-ready)
- Clear layer separation
- Unified import paths (`lib/client/*`, `core/*`, etc.)
- Zero unused code
- 100% Clean Architecture 4-Layer compliance

---

## ⚡ Quick Reference: Commands

```bash
# Phase 1: Tier 1 Removal
rm -rf lib/models/
rm app/hooks/useBookmarkWatchlist.ts

# Verify
npm run lint && npm run type-check && npm test

# Phase 2: Tier 2 Checks
grep -r "AuthContext" app/ lib/
grep -r "helpers" lib/

# Phase 3: Commit
git add .
git commit -m "Phase 10: Clean Architecture 4-Layer cleanup complete"
```

---

## ✨ SUMMARY

**Safe Removals** (Do immediately):
- ✅ `lib/models/*` (all old mongoose models)
- ✅ `app/hooks/useBookmarkWatchlist.ts`

**Conditional Removals** (After verification):
- ⚠️ `lib/contexts/AuthContext.tsx` (if not used)
- ⚠️ `lib/utils/helpers.ts` (if duplicated in lib/client/utils.ts)

**Keep** (Core Clean Architecture):
- ✅ Everything in `core/`, `infrastructure/`, `lib/client/`
- ✅ All API routes and pages
- ✅ All configuration, constants, types

**Result**: 100% Clean Architecture 4-Layer compliance ✨
