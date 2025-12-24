# Implementation Guide: Components & File Organization

## Quick Start: Using the New Components

### 1. **Student Dashboard** Example Integration

**File**: `app/(student)/dashboard/page.tsx`

```tsx
"use client";
import MissionControl from "@/components/student/dashboard/MissionControl";
import StreakCounter from "@/components/student/dashboard/StreakCounter";
import SubjectMap from "@/components/student/dashboard/SubjectMap";
import { useRouter } from "next/navigation";

// Sample chapter data (replace with real data from backend)
const SAMPLE_CHAPTERS = [
  {
    id: "1",
    title: "Fractions Basics",
    masteryScore: 85,
    status: "unlocked",
    topicsCount: 8,
    questionsCompleted: 12,
  },
  {
    id: "2",
    title: "Decimals & Percentages",
    masteryScore: 65,
    status: "unlocked",
    topicsCount: 10,
    questionsCompleted: 7,
  },
  {
    id: "3",
    title: "Angles & Geometry",
    masteryScore: 30,
    status: "unlocked",
    topicsCount: 12,
    questionsCompleted: 3,
  },
  {
    id: "4",
    title: "Algebra Intro",
    masteryScore: 0,
    status: "locked",
    topicsCount: 15,
    questionsCompleted: 0,
  },
];

export default function StudentDashboard() {
  const router = useRouter();

  const handleStartMission = () => {
    router.push("/student/arena");
  };

  return (
    <div className="space-y-8">
      {/* Mission Control */}
      <MissionControl
        missionTitle="Today's Mission"
        missionDescription="Review Fractions and Angles - Practice 5 questions"
        rewardXP={50}
        isCompleted={false}
        onStartMission={handleStartMission}
      />

      {/* Streak Counter */}
      <StreakCounter
        streakDays={7}
        lastActivityDate="Today at 3:45 PM"
        personalBest={15}
      />

      {/* Subject Map */}
      <SubjectMap chapters={SAMPLE_CHAPTERS} subject="Mathematics" />
    </div>
  );
}
```

### 2. **Parent Dashboard** Example Integration

**File**: `app/(parent)/dashboard/page.tsx`

```tsx
"use client";
import NarrativeReport from "@/components/parent/dashboard/NarrativeReport";
import WeaknessRadar from "@/components/parent/dashboard/WeaknessRadar";

// Sample insights data
const SAMPLE_INSIGHTS = [
  {
    text: "Rahul completed 12 quizzes this week and scored 8.2/10 on average",
    type: "positive",
    actionable: false,
  },
  {
    text: "Strong improvement in Fractions (from 65% to 85% mastery)",
    type: "positive",
    actionable: true,
  },
  {
    text: "Needs practice with Angles - only 30% mastery",
    type: "concern",
    actionable: true,
  },
  {
    text: "Completed 3-day streak! Keep encouraging daily practice",
    type: "neutral",
    actionable: false,
  },
];

const SAMPLE_WEAK_CONCEPTS = [
  {
    id: "1",
    conceptName: "Improper Fractions",
    misconceptionGuide:
      "Tip: Remind him that the numerator is larger than the denominator. Visual aids (pizza slices) help!",
    failureRate: 75,
    lastFailedDate: "Dec 22, 2025",
    topicsRelated: ["Mixed Numbers", "Fraction Addition"],
  },
  {
    id: "2",
    conceptName: "Angle Measurement",
    misconceptionGuide:
      "Many kids think all angles look like 90°. Show variety - acute, obtuse, reflex angles with real objects.",
    failureRate: 60,
    lastFailedDate: "Dec 20, 2025",
    topicsRelated: ["Triangles", "Perpendicular Lines"],
  },
];

export default function ParentDashboard() {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what Rahul has been up to this week
        </p>
      </div>

      {/* Narrative Report */}
      <NarrativeReport
        insights={SAMPLE_INSIGHTS}
        weekStartDate="Dec 18 - Dec 24, 2025"
        childName="Rahul"
      />

      {/* Weakness Radar */}
      <WeaknessRadar
        weakConcepts={SAMPLE_WEAK_CONCEPTS}
        childName="Rahul"
      />
    </div>
  );
}
```

### 3. **Onboarding Wizard** Integration

**File**: `app/onboarding/page.tsx`

```tsx
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
```

---

## Data Flow Architecture

### Student Dashboard Data Flow

```
┌─────────────────────────────────────────────────────┐
│  Student Dashboard (Page Component - Server)         │
└────────────┬────────────────────────────────────────┘
             │
             ├─→ Fetch student progress (cached)
             │   └─→ Backend: GET /api/progress/{userId}
             │       (Redis TTL: 30s)
             │
             └─→ Hydrate page with initial data (SSR)
                 │
                 ├─→ MissionControl (Client)
                 │   └─→ useMissionData() hook (SWR)
                 │       └─→ Real-time mission status
                 │
                 ├─→ StreakCounter (Client)
                 │   └─→ useStreakData() hook
                 │       └─→ Animations & progress
                 │
                 └─→ SubjectMap (Client)
                     └─→ useStudentProgress() hook (SWR)
                         └─→ Chapter mastery, navigation
```

### Parent Dashboard Data Flow

```
┌────────────────────────────────────────────────┐
│  Parent Dashboard (Page Component - Server)     │
└────────────┬─────────────────────────────────┘
             │
             ├─→ GET /api/analytics/{childId}/insights
             │   └─→ Backend generates AI insights
             │       (Cached: 1 hour)
             │
             ├─→ GET /api/analytics/{childId}/weaknesses
             │   └─→ Aggregated failure rates
             │       (Cached: 1 hour)
             │
             └─→ Hydrate page (SSR)
                 │
                 ├─→ NarrativeReport (Client)
                 │   └─→ Expandable insight cards
                 │
                 └─→ WeaknessRadar (Client)
                     └─→ Expandable concept guides
```

---

## Backend Integration (Key Endpoints)

### Quiz/Progress API Routes

```python
# backend/app/api/quiz.py
@router.get("/api/quiz/{quiz_id}")
async def get_quiz(quiz_id: str, db: Session = Depends(get_db)):
    """
    Returns quiz questions with options.
    Cached in Redis for 1 hour.
    """
    pass

@router.post("/api/quiz/{quiz_id}/submit")
async def submit_answer(
    quiz_id: str,
    submission: QuizSubmissionSchema,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Accepts student answer, grades immediately.
    Updates user progress and mastery score.
    """
    pass
```

### Progress API Routes

```python
# backend/app/api/progress.py
@router.get("/api/progress/{user_id}")
async def get_student_progress(user_id: str, db: Session = Depends(get_db)):
    """
    Returns: {
        xp: int,
        streak: int,
        masteryBySubject: {},
        lastActivityTime: str
    }
    """
    pass
```

### Analytics API Routes

```python
# backend/app/api/analytics.py
@router.get("/api/analytics/{child_id}/insights")
async def get_weekly_insights(child_id: str, db: Session = Depends(get_db)):
    """
    Returns AI-generated insights for parent dashboard.
    Returns: [
        {
            text: str,
            type: "positive" | "concern" | "neutral"
            actionable: bool
        }
    ]
    """
    pass

@router.get("/api/analytics/{child_id}/weaknesses")
async def get_weakness_radar(child_id: str, db: Session = Depends(get_db)):
    """
    Returns concepts where child is struggling.
    Returns: [
        {
            conceptName: str,
            failureRate: float,
            misconceptionGuide: str,
            lastFailedDate: str
        }
    ]
    """
    pass
```

---

## Environment Setup

### 1. Install Dependencies (if needed)

```bash
cd /Users/kunalranjan/edtech/edtech-mvp-pipeline/frontend
npm install
```

### 2. Create `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_ENV=development
```

### 3. Run Development Server

```bash
npm run dev
# Open http://localhost:3000
```

---

## Testing Components in Isolation

### Test MissionControl

```tsx
// In any page.tsx
import MissionControl from "@/components/student/dashboard/MissionControl";

export default function TestPage() {
  return (
    <div className="p-8">
      <MissionControl
        missionTitle="Test Mission"
        missionDescription="Test Description"
        rewardXP={75}
        isCompleted={false}
        onStartMission={() => console.log("Mission started")}
      />
    </div>
  );
}
```

### Test SubjectMap

```tsx
import SubjectMap from "@/components/student/dashboard/SubjectMap";

const chapters = [
  {
    id: "1",
    title: "Chapter 1",
    masteryScore: 85,
    status: "unlocked",
  },
];

export default function TestPage() {
  return <SubjectMap chapters={chapters} />;
}
```

---

## Performance Optimization Tips

### 1. **Lazy Load Components** (if needed)

```tsx
import dynamic from "next/dynamic";

const SubjectMap = dynamic(
  () => import("@/components/student/dashboard/SubjectMap"),
  { loading: () => <div>Loading...</div> }
);
```

### 2. **Use React Query / SWR** for Real-time Data

```tsx
// hooks/useStudentProgress.ts
import useSWR from "swr";

export function useStudentProgress(userId: string) {
  const { data, error, isLoading } = useSWR(
    `/api/progress/${userId}`,
    fetch
  );

  return { progress: data, error, isLoading };
}
```

### 3. **Cache Strategy on Backend**

```python
from fastapi_cache2 import FastAPICache2
from fastapi_cache2.decorator import cache

@router.get("/api/progress/{user_id}")
@cache(expire=30)  # 30 seconds
async def get_student_progress(user_id: str):
    pass
```

---

## Next Steps

1. ✅ Components created and tested
2. ⏭️ Integrate with backend API routes
3. ⏭️ Add authentication context (useAuth hook)
4. ⏭️ Implement real-time updates (WebSocket optional)
5. ⏭️ Deploy to Vercel for production

All components are production-ready and scalable! 🚀
