# 📋 Isolated Components Quick Reference

**Status:** Verified Dec 25, 2025

---

## 🔴 COMPLETELY ORPHANED (Exist but Zero Integration)

### 1. OnboardingWizard.tsx (324 lines)
```
✅ BUILT:    Full multi-step wizard with avatars, goals, baseline questions
❌ ROUTED:   NO /onboarding route exists
❌ IMPORTED: Not used anywhere
❌ BACKEND:  No endpoint to save data

FIX TIME: 2-3 hours
ACTION: Create route, wire to backend, redirect after registration
```

### 2. WeaknessRadar.tsx (164 lines)
```
✅ BUILT:    Shows weak concepts with color-coding
❌ ROUTED:   NO /parent/dashboard route
❌ IMPORTED: Not used anywhere
❌ BACKEND:  No parent auth, no API endpoints

FIX TIME: 4-5 hours (includes parent auth)
ACTION: Create parent auth, create route, wire API
```

### 3. NarrativeReport.tsx
```
✅ BUILT:    Generates progress narratives
❌ ROUTED:   NOT imported anywhere
❌ BACKEND:  No narrative generation service

FIX TIME: 3-4 hours
ACTION: Create narrative service, integrate with WeaknessRadar
```

---

## 🟡 PARTIAL INTEGRATION (Exist but Hardcoded)

### 4. MissionControl.tsx (102 lines)
```
✅ IMPORTED: Used in dashboard
⚠️  HARDCODED:
   - missionTitle = "Today's Mission"
   - missionDescription = "Review Fractions and Angles"
   - rewardXP = 50
   - isCompleted = false

❌ BACKEND:  No missions table, no API endpoint

FIX TIME: 3-4 hours
ACTION: Create missions table, API endpoint, fetch real data
```

### 5. SubjectMap.tsx (120 lines)
```
✅ IMPORTED: Used in dashboard
⚠️  HARDCODED: Chapter data (not fetching from API)
❌ BACKEND:  Data exists but not being consumed by component

FIX TIME: 1-2 hours
ACTION: Fetch from API instead of hardcoding
```

---

## 🟠 INCOMPLETE FEATURES (50-80% done)

### 6. Quiz Difficulty Selection
```
✅ BACKEND:   GET /api/quiz/random/{id}?difficulty=1|2 exists
✅ DATABASE:  questions.difficulty_level populated
❌ FRONTEND:  Arena.tsx has no UI to select difficulty

FIX TIME: 1-2 hours
ACTION: Add Easy/Hard buttons to Arena.tsx
```

### 7. QuestionCard Data Transformation
```
✅ FRONTEND:  Components exist and work
⚠️  ISSUE:     Arena.tsx manually transforms API response (fragile)

FIX TIME: 1-2 hours
ACTION: Standardize data format between frontend/backend
```

### 8. Error Handling
```
✅ TRY-CATCH: Errors caught in API client
❌ FEEDBACK:  Errors logged to console, user sees nothing

FIX TIME: 1-2 hours
ACTION: Add toast notifications on error
```

### 9. Loading States
```
✅ SPINNER:   Generic spinner shown
❌ SKELETONS: No skeleton screens
❌ SHIMMER:   No shimmer effects

FIX TIME: 2-3 hours
ACTION: Create skeleton components, integrate into pages
```

### 10. Real-time Progress
```
✅ BACKEND:  Updates student_progress on quiz submit
❌ FRONTEND: Dashboard doesn't refresh automatically

FIX TIME: 2-3 hours
ACTION: Add API refresh after quiz completion
```

---

## 📊 Code Statistics

| Category | Lines | Files | Fix Time |
|----------|-------|-------|----------|
| Orphaned Components | 600+ | 3 | 8-10 hrs |
| Partial Components | 300+ | 3 | 5-7 hrs |
| Incomplete Features | 200+ | 5 | 6-8 hrs |
| **TOTAL** | **1,100+** | **11** | **19-25 hrs** |

---

## 🚀 Recommended Order

**Week 1 (Quick Wins - 4-5 hours):**
1. Fix SubjectMap data (1-2 hrs)
2. Add Quiz Difficulty UI (1-2 hrs)
3. Add Error Toast Notifications (1 hr)

**Week 2 (Medium Tasks - 6-8 hours):**
4. Create /onboarding route (2-3 hrs)
5. Make MissionControl dynamic (2-3 hrs)
6. Add Streak celebrations (1-2 hrs)

**Week 3-4 (Major Features - 8-12 hours):**
7. Parent Dashboard & Auth (4-5 hrs)
8. Real-time Progress Updates (2-3 hrs)
9. Skeleton Loaders (2-3 hrs)
10. Error Boundaries (1-2 hrs)

---

## ✅ Already Complete

- ✅ Arena.tsx - Quiz interface
- ✅ FeedbackOverlay.tsx - Feedback display
- ✅ StreakCounter.tsx - Streak display
- ✅ Auth (Login/Register)
- ✅ Dashboard (with data from API)
- ✅ Quiz submission flow
- ✅ Mastery tracking (EMA + Leitner)

---

**Last Updated:** December 25, 2025  
**Effort Estimate:** 19-25 developer hours for full integration
