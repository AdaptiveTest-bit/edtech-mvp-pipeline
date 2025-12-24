# EdTech MVP Architecture

## Directory Structure & Scalability Strategy

### 1. **Frontend Structure** (`/frontend/src`)

```
src/
├── app/                          # Next.js App Router (Pages & Layouts)
│   ├── (auth)/                  # Auth routes (grouped, no layout)
│   │   ├── login/page.tsx       # Server component wrapper
│   │   ├── register/page.tsx
│   │   └── layout.tsx           # AuthLayout wrapper
│   │
│   ├── (student)/               # Student dashboard routes
│   │   ├── layout.tsx           # StudentLayout (persistent sidebar)
│   │   ├── dashboard/page.tsx   # Main student dashboard
│   │   ├── arena/page.tsx       # Quiz Arena
│   │   ├── missions/page.tsx    # Daily missions
│   │   ├── chapter/[id]/page.tsx # Chapter detail
│   │   └── profile/page.tsx
│   │
│   ├── (parent)/                # Parent dashboard routes
│   │   ├── layout.tsx           # ParentLayout (analytics style)
│   │   ├── dashboard/page.tsx   # Parent overview
│   │   ├── reports/[childId]/page.tsx
│   │   ├── insights/page.tsx
│   │   └── settings/page.tsx
│   │
│   ├── onboarding/              # Cold start wizard
│   │   ├── page.tsx
│   │   └── layout.tsx
│   │
│   ├── api/                     # API routes (server-side)
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── quiz/route.ts
│   │   ├── progress/route.ts
│   │   └── analytics/route.ts
│   │
│   ├── globals.css
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
│
├── components/                  # Reusable UI components
│   │
│   ├── auth/                    # Authentication components (client)
│   │   ├── AuthLayout.tsx       # Wrapper with split screen
│   │   ├── AuthTabs.tsx         # Student/Parent toggle
│   │   ├── AuthForm.tsx         # Form with email/password
│   │   └── SocialLoginButton.tsx
│   │
│   ├── student/                 # Student-specific components (client)
│   │   ├── StudentLayout.tsx    # Shell/wrapper component
│   │   ├── StudentHeader.tsx    # HUD with XP/Streak
│   │   ├── StudentSidebar.tsx   # Navigation
│   │   │
│   │   ├── dashboard/           # Dashboard sub-components
│   │   │   ├── MissionControl.tsx    # CTA card
│   │   │   ├── StreakCounter.tsx     # Streak display
│   │   │   ├── SubjectMap.tsx        # Chapter list
│   │   │   └── AvatarSelector.tsx    # Profile avatar
│   │   │
│   │   ├── quiz/                # Quiz/Arena components
│   │   │   ├── Arena.tsx             # Main quiz container
│   │   │   ├── QuestionCard.tsx      # Single question
│   │   │   ├── FeedbackOverlay.tsx   # Correct/Incorrect
│   │   │   ├── QuizProgress.tsx      # Progress bar
│   │   │   └── OptionButton.tsx      # Reusable option
│   │   │
│   │   └── missions/            # Mission components
│   │       ├── MissionList.tsx
│   │       └── MissionCard.tsx
│   │
│   ├── parent/                  # Parent-specific components (client)
│   │   ├── ParentLayout.tsx     # Analytics shell
│   │   ├── ParentHeader.tsx     # Breadcrumbs + Child Switcher
│   │   ├── ParentSidebar.tsx
│   │   │
│   │   ├── dashboard/           # Parent dashboard sub-components
│   │   │   ├── NarrativeReport.tsx   # AI insights summary
│   │   │   ├── WeaknessRadar.tsx     # Struggling concepts
│   │   │   ├── ProgressChart.tsx     # Mastery over time
│   │   │   └── ChildCard.tsx
│   │   │
│   │   └── insights/
│   │       ├── InsightCard.tsx
│   │       └── PracticeButton.tsx
│   │
│   ├── onboarding/              # Wizard components (client)
│   │   ├── OnboardingWizard.tsx     # Main wizard
│   │   ├── WizardStep1.tsx          # Identity
│   │   ├── WizardStep2.tsx          # Goal
│   │   ├── WizardStep3.tsx          # Baseline
│   │   ├── AvatarGrid.tsx           # Avatar picker
│   │   └── ProgressBar.tsx
│   │
│   └── common/                  # Shared UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Loader.tsx
│       ├── Modal.tsx
│       └── ErrorBoundary.tsx
│
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts              # Auth context/session
│   ├── useQuizState.ts         # Quiz persistence
│   ├── useDashboardData.ts     # SWR/React Query wrapper
│   └── useLocalStorage.ts      # Safe localStorage wrapper
│
├── context/                     # React Context (global state)
│   ├── AuthContext.tsx         # User auth state
│   ├── StudentContext.tsx      # Student-specific data
│   ├── ParentContext.tsx       # Parent-specific data
│   └── ThemeContext.tsx
│
├── services/                    # API client functions
│   ├── api.ts                  # Axios/fetch config
│   ├── authService.ts          # Auth API calls
│   ├── quizService.ts          # Quiz API calls
│   ├── progressService.ts      # Progress tracking
│   ├── analyticsService.ts     # Parent analytics
│   └── onboardingService.ts    # Onboarding data
│
├── types/                       # TypeScript interfaces
│   ├── auth.ts
│   ├── quiz.ts
│   ├── student.ts
│   ├── parent.ts
│   └── common.ts
│
├── utils/                       # Utility functions
│   ├── validation.ts           # Form validation
│   ├── formatting.ts           # Date/number formatting
│   ├── localStorage.ts         # Safe storage wrappers
│   └── constants.ts            # App-wide constants
│
└── lib/                        # Third-party integrations
    ├── tailwind.ts
    ├── auth.ts                 # NextAuth config
    └── swr.ts                  # SWR config
```

### 2. **Backend Structure** (`/backend`)

```
backend/
├── main.py                      # FastAPI entry point
├── requirements.txt
├── .env.example
│
├── app/
│   ├── __init__.py
│   ├── config.py               # Environment & DB config
│   ├── database.py             # DB connection pool
│   │
│   ├── api/                    # API route handlers
│   │   ├── __init__.py
│   │   ├── auth.py             # POST /auth/login, /auth/register
│   │   ├── quiz.py             # GET /quiz/[id], POST /quiz/[id]/submit
│   │   ├── progress.py         # GET /progress/[userId]
│   │   ├── analytics.py        # GET /analytics/[childId]
│   │   ├── student.py          # GET /student/profile
│   │   └── parent.py           # GET /parent/dashboard
│   │
│   ├── models/                 # SQLAlchemy models (DB schema)
│   │   ├── __init__.py
│   │   ├── user.py             # User, Parent, Student
│   │   ├── quiz.py             # Question, Quiz, Submission
│   │   ├── progress.py         # UserProgress, Mastery
│   │   ├── mission.py          # Mission, MissionCompletion
│   │   └── analytics.py        # Analytics aggregate
│   │
│   ├── schemas/                # Pydantic schemas (validation & serialization)
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── quiz.py
│   │   ├── student.py
│   │   ├── parent.py
│   │   └── common.py
│   │
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py     # JWT, password hashing
│   │   ├── quiz_service.py     # Question selection, grading
│   │   ├── progress_service.py # Mastery calculation
│   │   ├── analytics_service.py # Insights generation
│   │   ├── mission_service.py  # Daily missions
│   │   └── ai_service.py       # LLM integration (future)
│   │
│   ├── middleware/
│   │   ├── __init__.py
│   │   ├── auth.py             # JWT verification
│   │   ├── rate_limit.py       # Rate limiting
│   │   └── error_handler.py    # Global error handling
│   │
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── validators.py
│   │   ├── jwt_utils.py
│   │   └── constants.py
│   │
│   └── cache/                  # Redis integration
│       ├── __init__.py
│       ├── redis_client.py
│       └── cache_keys.py
│
└── tests/                      # Unit & integration tests
    ├── __init__.py
    ├── test_auth.py
    ├── test_quiz.py
    └── test_progress.py
```

### 3. **Database Schema** (`/database`)

```
database/
├── DDL/
│   ├── 01_users.sql              # User, Parent, Student
│   ├── 02_quiz.sql               # Question, Quiz, Option
│   ├── 03_submissions.sql        # QuizSubmission, Answer
│   ├── 04_progress.sql           # UserProgress, Mastery
│   ├── 05_missions.sql           # Mission, MissionCompletion
│   ├── 06_analytics.sql          # AggregatedMetrics
│   └── 07_indexes.sql            # Performance indexes
│
└── DML/
    ├── seed-users.sql           # Test data
    ├── seed-questions.sql
    └── seed-missions.sql
```

---

## Key Architectural Decisions for Scalability

### **1. Component Placement Strategy**

| Component Type | Location | Server/Client | Why |
|---|---|---|---|
| **Page wrappers** | `app/` | Server | SSR, metadata, initial data fetch |
| **Layouts** (StudentLayout, ParentLayout) | `components/` | Client (`"use client"`) | Need interactivity, context providers |
| **Quiz/Dashboard cards** | `components/student/` | Client | Real-time state, animations |
| **API routes** | `app/api/` | Server | Security, DB access, no client exposure |
| **Business logic** | `backend/services/` | Server | Performance, security, reusability |
| **Shared UI** | `components/common/` | Client | Buttons, modals, cards |

### **2. Data Flow for Heavy Load**

```
Student Dashboard Load Flow:
────────────────────────────────

1. User visits /student/dashboard (Server)
   ↓
2. Next.js page.tsx runs on server
   - Calls `getStudentProgress(userId)` from backend
   ↓
3. Backend Service (progress_service.py)
   - Checks Redis cache first (30-sec TTL)
   - If miss, queries DB (indexed queries)
   - Returns cached JSON
   ↓
4. Page hydrates with initial data (SSR)
   ↓
5. Client-side components mount
   - StudentLayout provider setup
   - SWR hooks for real-time updates
   ↓
6. Real-time updates (XP gained, streak, etc.)
   - Polling via SWR (fallback every 10s)
   - WebSocket alternative (for future scaling)
```

### **3. Caching Strategy**

```python
# backend/app/cache/cache_keys.py
CACHE_KEYS = {
    "student_progress": f"student:{user_id}:progress",  # TTL: 30s
    "student_dashboard": f"student:{user_id}:dashboard",  # TTL: 60s
    "quiz_questions": f"quiz:{quiz_id}:questions",  # TTL: 1 hour
    "leaderboard": "leaderboard:daily",  # TTL: 5 min
    "parent_insights": f"parent:{parent_id}:insights",  # TTL: 1 hour
}
```

### **4. Database Optimization**

```sql
-- Key indexes for heavy load
CREATE INDEX idx_user_id_created ON quiz_submissions(user_id, created_at DESC);
CREATE INDEX idx_parent_id_student ON users(parent_id) WHERE role='student';
CREATE INDEX idx_quiz_status ON quiz_submissions(user_id, status) WHERE status='pending';
CREATE INDEX idx_mastery_score ON user_progress(user_id, subject_id, mastery_score);
```

### **5. Load Distribution**

```
Frontend (Next.js):
  - SSR for initial load (fast FCP)
  - ISR for static content (quizzes, chapters)
  - Client-side SWR for dynamic data (XP, streak)

Backend (FastAPI):
  - Async handlers for I/O-heavy operations
  - Connection pooling (SQLAlchemy pool_size=20)
  - Redis for session caching
  - Rate limiting per student (100 quiz submissions/hour)

Database:
  - Read replicas for analytics queries
  - Write to primary (quiz submissions, progress)
  - Connection pool on backend
```

---

## File Placement Quick Reference

### **New Component: MissionControl**
- **Location**: `src/components/student/dashboard/MissionControl.tsx`
- **Type**: Client component (`"use client"`)
- **Data source**: `useMissionData()` hook → SWR → backend `/api/missions/today`
- **Parent**: `app/(student)/dashboard/page.tsx`

### **New Component: SubjectMap**
- **Location**: `src/components/student/dashboard/SubjectMap.tsx`
- **Type**: Client component
- **Data source**: `useStudentProgress()` hook
- **Interaction**: Link to `app/(student)/chapter/[id]/page.tsx`

### **New Component: NarrativeReport**
- **Location**: `src/components/parent/dashboard/NarrativeReport.tsx`
- **Type**: Client component
- **Data source**: `useParentInsights()` hook → backend `/api/analytics/insights`

### **New Component: OnboardingWizard**
- **Location**: `src/components/onboarding/OnboardingWizard.tsx`
- **Type**: Client component
- **Data source**: Form state → POST `/api/onboarding/complete`
- **Route**: `app/onboarding/page.tsx`

---

## Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────────────────┐
│                    CloudFlare / CDN                         │
└────────────┬────────────────────────────────────┬───────────┘
             │                                    │
    ┌────────▼─────────┐              ┌──────────▼────────┐
    │   Vercel/Netlify │              │   AWS API Gateway  │
    │  (Next.js + SWR) │              │  (FastAPI Backend) │
    └────────┬─────────┘              └──────────┬────────┘
             │                                   │
             └──────────────┬────────────────────┘
                            │
           ┌────────────────┼────────────────┐
           │                │                │
      ┌────▼───┐      ┌─────▼────┐    ┌────▼────┐
      │ Redis  │      │PostgreSQL│    │ S3/CDN  │
      │(Cache) │      │ (Primary)│    │(Images) │
      └────────┘      └──────────┘    └─────────┘
```

---

## Performance Targets

- **FCP (First Contentful Paint)**: < 1.5s
- **TTI (Time to Interactive)**: < 3.5s
- **API Response Time**: < 200ms (cached), < 500ms (uncached)
- **Concurrent Users**: 10,000+ (with horizontal scaling)
- **Quiz Submission Rate**: 1000+ submissions/minute

This structure ensures scalability through separation of concerns, proper caching, and optimized data flow.
