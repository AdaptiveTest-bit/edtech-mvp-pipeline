# 🏗️ SYSTEM ARCHITECTURE

**Updated:** December 25, 2025  
**Version:** 2.0 (Post Phase 2)

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                    (Next.js Frontend)                           │
│                      Port: 3000                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    HTTP/JSON API Calls
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                        API GATEWAY                              │
│                      (FastAPI Server)                           │
│                      Port: 8000                                 │
│    ┌──────────────────────────────────────────────────────┐    │
│    │  Routes: /api/auth, /api/student, /api/missions,    │    │
│    │          /api/quiz, /api/progress, /api/onboarding  │    │
│    └──────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                      Database Queries
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      DATA LAYER                                 │
│              (PostgreSQL Database)                              │
│    ┌──────────────────────────────────────────────────────┐    │
│    │  7 Tables: users, curriculum, analytics,            │    │
│    │           quiz_submissions, student_progress,       │    │
│    │           onboarding_status, missions               │    │
│    └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Detailed Layer Architecture

### Frontend Layer (Next.js + React)

**Structure:**
```
frontend/
├── src/app/                 # Page routes (file-based routing)
│   ├── page.tsx            # Home page
│   ├── login/              # /login
│   ├── register/           # /register → /onboarding
│   ├── onboarding/         # /onboarding (NEW)
│   ├── dashboard/          # /dashboard
│   ├── quiz/               # /quiz/arena
│   ├── progress/           # /progress
│   └── profile/            # /profile
├── src/components/         # Reusable React components
│   ├── student/
│   │   ├── dashboard/      # Dashboard components
│   │   │   ├── StreakCounter.tsx
│   │   │   ├── MissionControl.tsx (NEW)
│   │   │   └── SubjectMapContainer.tsx
│   │   └── quiz/           # Quiz components
│   ├── common/             # Navbar, footer, etc.
│   ├── layout/             # Layout wrappers
│   └── onboarding/         # Onboarding components
├── src/context/            # Global state management
│   └── StudentContext.tsx  # Auth state (student info + login/logout)
├── src/lib/
│   └── api.ts              # API client (20+ functions)
└── package.json            # Dependencies (Next.js, Tailwind v4, react-confetti, react-hot-toast)
```

**Technology Choices:**
- **Next.js 16.1.0** - SSR/SSG for performance, file-based routing
- **React 19** - Component library with hooks
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS v4.1.18** - Utility-first CSS
- **react-hot-toast** - Toast notifications
- **react-confetti** - Celebration animations

**Key Patterns:**
- Client components with `"use client"` directive
- React Context for auth state (StudentContext)
- useEffect for data fetching
- Conditional rendering based on auth state
- Error boundaries for error handling
- Loading states for async operations

### API Gateway Layer (FastAPI)

**Structure:**
```
backend/
├── main.py                      # Uvicorn server entry point
├── app/
│   ├── __init__.py              # Router registration
│   ├── database.py              # SQLAlchemy session management
│   ├── core/
│   │   ├── config.py            # Config (DATABASE_URL, DEBUG, etc.)
│   │   └── security.py          # JWT token handling
│   ├── models/                  # SQLAlchemy ORM models
│   │   ├── user.py              # User model
│   │   ├── curriculum.py        # Chapter/Concept models
│   │   ├── analytics.py         # Analytics/Score models
│   │   ├── onboarding.py        # OnboardingStatus model (NEW)
│   │   ├── mission.py           # Mission model (NEW)
│   │   └── __init__.py          # Model imports
│   ├── schemas/                 # Pydantic request/response validation
│   │   ├── auth.py
│   │   ├── quiz.py
│   │   ├── student.py
│   │   └── __init__.py
│   ├── services/                # Business logic
│   │   ├── student_service.py   # Student operations
│   │   ├── quiz_service.py      # Quiz operations
│   │   ├── mastery_service.py   # Score calculation
│   │   ├── onboarding_service.py (NEW)
│   │   ├── mission_service.py   (NEW)
│   │   └── __init__.py
│   └── api/routes/              # API endpoint definitions
│       ├── auth.py              # /api/auth/* routes
│       ├── student.py           # /api/student/* routes
│       ├── quiz.py              # /api/quiz/* routes
│       ├── progress.py          # /api/progress/* routes
│       ├── onboarding.py        # /api/onboarding/* routes (NEW)
│       ├── missions.py          # /api/missions/* routes (NEW)
│       └── __init__.py
└── requirements.txt             # Python dependencies
```

**Technology Choices:**
- **FastAPI** - Modern async Python framework
- **Uvicorn** - ASGI server
- **SQLAlchemy** - ORM for database operations
- **Pydantic** - Request/response validation
- **PostgreSQL drivers** - psycopg2 for database connection

**Key Patterns:**
- Async/await for non-blocking I/O
- Dependency injection (Depends()) for database sessions
- Router-based API organization
- Pydantic models for validation
- Service layer for business logic
- Error handling with HTTPException

### Data Layer (PostgreSQL)

**Database Schema:**

```sql
-- Core Users Table
users (id, email, password_hash, name, grade_level, created_at)

-- Curriculum Content
curriculum (concept_id, chapter_id, name, description)

-- Quiz Questions
quiz_questions (id, concept_id, question_text, options, correct_option)

-- Student Analytics
analytics (student_id, total_xp, current_streak, best_streak, created_at)

-- Quiz Submissions
quiz_submissions (id, student_id, question_id, is_correct, xp_earned, submitted_at)

-- Progress Tracking
student_progress (id, student_id, chapter_id, mastery_score, questions_completed)

-- Onboarding Status (NEW)
onboarding_status (id, student_id, completed, avatar_selected, goals, baseline_score)

-- Daily Missions (NEW)
missions (id, student_id, title, description, reward_xp, status, due_date, completed_at)
```

**Indexes for Performance:**
- `idx_users_email` - Fast user lookup
- `idx_quiz_concept_id` - Fast question retrieval
- `idx_onboarding_student_id` - Fast onboarding status lookup
- `idx_missions_student_id` - Fast mission lookup
- `idx_missions_status` - Fast status filtering
- `idx_missions_due_date` - Fast due date filtering

---

## 🔗 Data Flow Examples

### User Registration Flow
```
1. User fills form on /register page
2. Frontend: POST /api/auth/register/student
3. Backend: Validate email, hash password, create user
4. Database: Insert new record in users table
5. Backend: Generate JWT token, return user data
6. Frontend: Store token + user info in StudentContext
7. Frontend: Redirect to /onboarding
```

### Dashboard Data Loading Flow
```
1. User visits /dashboard
2. Frontend: Check StudentContext for auth
3. Frontend: If not authenticated → redirect to /login
4. Frontend: useEffect triggers on mount
5. Frontend: Fetch /api/student/{id}/progress
6. Backend: Query database for student progress
7. Database: Return chapters with mastery scores
8. Frontend: Display progress cards + mission card + subject map
```

### Mission Completion Flow
```
1. User on dashboard sees mission card
2. User clicks "Complete Mission" button
3. Frontend: POST /api/missions/{mission_id}/complete
4. Backend: Find mission, mark as complete, calculate XP reward
5. Database: Update mission status + student analytics
6. Backend: Return success + XP earned
7. Frontend: Show toast: "🎉 Mission completed! +75 XP"
8. Frontend: Remove mission card or show "No Mission Today"
```

---

## 🔐 Security Architecture

### Authentication Flow
```
Client                          Backend
  │                              │
  ├─ POST /api/auth/login ──────>│
  │    (email, password)          │
  │                              │
  │<──── JWT Token ──────────────┤
  │                              │
  ├─ GET /api/student/1 ────────>│
  │    (Authorization: Bearer)    │
  │                              │
  │<──── User Data ──────────────┤
```

### Token Management
- JWT tokens generated on login/registration
- Token stored in localStorage
- Token sent in Authorization header on authenticated requests
- Token expires after configurable period (set in backend config)

### Protected Routes
```typescript
// Frontend example
export default function DashboardPage() {
  const router = useRouter();
  const { student } = useStudent();

  useEffect(() => {
    if (!student) {
      router.push("/login");  // Redirect if not authenticated
    }
  }, [student, router]);

  if (!student) return null;
  
  // Render dashboard only if authenticated
}
```

---

## 🎯 Component Interaction Diagram

```
StudentContext (Global Auth State)
    ├── student: { id, email, name, token }
    ├── login(credentials)
    └── logout()
           │
           ├─ Used by: LoginPage, RegisterPage, DashboardPage
           ├─ Used by: Navbar (show/hide based on auth)
           └─ Used by: API client (auto-include token in requests)

API Client (frontend/src/lib/api.ts)
    ├── getStudentProgress(studentId)
    ├── getTodayMission(studentId)
    ├── completeMission(studentId, missionId)
    ├── saveOnboarding(studentId, avatar, goals, score)
    └── etc... (20+ functions)
           │
           ├─ Called by: Dashboard components
           ├─ Called by: Quiz components
           ├─ Called by: Onboarding page
           └─ Called by: Progress components

React Components
    ├── Pages: login, register, onboarding, dashboard, quiz, progress
    │
    ├── Dashboard Components
    │   ├── SubjectMapContainer (fetches progress)
    │   ├── MissionControl (fetches + displays missions)
    │   └── StreakCounter (shows streak + triggers confetti)
    │
    ├── Quiz Components
    │   └── Arena (difficulty selector, questions, submit)
    │
    └── Onboarding Components
        └── 2-step wizard (avatar → goals)
```

---

## 📊 Database Relationships

```
users (1) ──────── (many) student_progress
         ──────── (many) quiz_submissions
         ──────── (many) analytics
         ──────── (1) onboarding_status
         ──────── (many) missions

curriculum (1) ──────── (many) quiz_questions
           ──────── (many) student_progress

quiz_questions (1) ──────── (many) quiz_submissions
```

---

## 🚀 Deployment Architecture (Future)

```
┌─────────────────────────────────────┐
│      Cloud Provider (AWS/GCP)       │
│                                     │
│  ┌───────────────────────────────┐  │
│  │   Load Balancer / CDN          │  │
│  │   (Distribute traffic)         │  │
│  └──────────┬────────────────────┘  │
│             │                        │
│  ┌──────────▼────────────────────┐  │
│  │  Frontend (Next.js)           │  │
│  │  - Static content via CDN    │  │
│  │  - Multiple instances        │  │
│  └──────────┬────────────────────┘  │
│             │                        │
│  ┌──────────▼────────────────────┐  │
│  │  API Gateway (FastAPI)        │  │
│  │  - Multiple instances         │  │
│  │  - Auto-scaling              │  │
│  └──────────┬────────────────────┘  │
│             │                        │
│  ┌──────────▼────────────────────┐  │
│  │  RDS PostgreSQL              │  │
│  │  - Managed database          │  │
│  │  - Automatic backups         │  │
│  │  - Read replicas             │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Monitoring & Logging        │  │
│  │  - CloudWatch / DataDog      │  │
│  │  - Error tracking            │  │
│  │  - Performance metrics       │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 📈 Scalability Considerations

### Database
- Connection pooling for efficient resource use
- Indexes on frequently queried columns
- Query optimization for complex queries
- Read replicas for scaling read operations

### API Server
- Stateless design allows horizontal scaling
- Async request handling for concurrency
- Load balancing across multiple instances
- Caching for frequently accessed data

### Frontend
- Static page generation (SSG) where possible
- Code splitting for smaller bundle sizes
- Image optimization
- CDN distribution for global users

---

## 🔧 Technology Decisions & Rationale

### Why Next.js?
- Built-in routing (no need for react-router)
- Server-side rendering (SSR) and static site generation (SSG)
- API routes for simple backends
- Excellent developer experience
- Great TypeScript support

### Why FastAPI?
- Modern Python framework with async support
- Automatic API documentation (Swagger)
- Great validation with Pydantic
- Fast performance (comparable to Node.js)
- Easy to learn and extend

### Why PostgreSQL?
- Robust relational database
- JSONB support for flexible schemas
- Strong consistency guarantees
- Excellent indexing capabilities
- Great ecosystem and community support

### Why Tailwind CSS?
- Utility-first approach (fast development)
- No naming conflicts
- Easy theming
- Small bundle size
- Large community

---

## 📋 Architectural Principles

1. **Separation of Concerns**
   - Frontend handles UI/UX
   - Backend handles business logic
   - Database handles data persistence

2. **Stateless Services**
   - API server doesn't store state
   - All state in database or client
   - Enables easy horizontal scaling

3. **Type Safety**
   - TypeScript in frontend
   - Python type hints in backend
   - Pydantic validation on API
   - Prevents runtime errors

4. **DRY (Don't Repeat Yourself)**
   - Shared validation logic
   - Reusable components
   - Service layer for business logic

5. **KISS (Keep It Simple, Stupid)**
   - No over-engineering
   - Clear, readable code
   - Minimal dependencies
   - Easy to maintain

---

## 🧪 Testing Strategy

### Frontend Testing
- Unit tests for components (Jest + React Testing Library)
- Integration tests for API calls
- E2E tests for user flows (Cypress/Playwright)

### Backend Testing
- Unit tests for services (pytest)
- Integration tests for API endpoints
- Database tests for migrations

### Manual Testing
- Smoke tests for critical paths
- UAT with real users
- Performance testing under load

---

## 📚 Further Reading

- **Next.js Docs:** https://nextjs.org/docs
- **FastAPI Docs:** https://fastapi.tiangolo.com
- **SQLAlchemy Docs:** https://docs.sqlalchemy.org
- **PostgreSQL Docs:** https://www.postgresql.org/docs
- **Tailwind CSS Docs:** https://tailwindcss.com/docs

---

**Architecture Document:** December 25, 2025  
**Last Updated:** Phase 2 Completion  
**Next Update:** Before Phase 3 Planning
