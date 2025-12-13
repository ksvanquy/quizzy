# 🚀 EXECUTION PLAN: Safe Old Files Removal

**Status**: Identified `lib/models/` is used in `seed.ts` and `debug.ts`  
**Updated Plan**: Remove imports from seed files first, then delete models  
**Timeline**: Safe, Verified Deletion

---

## ✅ STEP-BY-STEP EXECUTION

### STEP 1: Update seed.ts (Remove old model imports)

**Current State**: Uses `lib/models/*` imports  
**Target**: Remove old imports (seed.ts can be deprecated or updated to use repositories)

### STEP 2: Update debug.ts (Remove old model imports)

**Current State**: Uses `lib/models/Quiz`  
**Target**: Remove or update debug file

### STEP 3: Remove app-level old hooks

**Safe**: `app/hooks/useBookmarkWatchlist.ts` - not used anywhere

### STEP 4: Verify and Delete lib/models/

**After**: All imports updated → Safe to delete

---

Let me start:
