# 🔧 Integration Fix Guide - Code Examples

**Purpose:** Show exact code changes needed to integrate orphaned/partial components

---

## 🎯 Fix #1: Connect SubjectMap to Real API Data

**File:** `frontend/src/app/dashboard/page.tsx`  
**Time:** 1-2 hours  
**Impact:** Medium

### Current Code (Hardcoded):
```typescript
export default function DashboardPage() {
  // ... other state ...
  
  // ❌ PROBLEM: Hardcoded chapters
  const chapters = [
    { id: 1, name: 'Mathematics', mastery: 65 },
    { id: 2, name: 'Science', mastery: 72 },
  ]
  
  return (
    <SubjectMap chapters={chapters} />
  )
}
```

### Fixed Code (Real API Data):
```typescript
export default function DashboardPage() {
  const router = useRouter();
  const { student } = useStudent();
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) {
      router.push("/login");
      return;
    }

    const fetchProgress = async () => {
      try {
        // ✅ FIXED: Fetch real data from API
        const data = await getStudentProgress(student.id);
        setProgress(data);
      } catch (err) {
        console.error("Failed to load progress:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [student, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!progress) return null;

  return (
    <div>
      {/* ✅ FIXED: Use real data instead of hardcoded */}
      <SubjectMap chapters={progress.chapters} />
    </div>
  );
}
```

---

## 🎯 Fix #2: Add Quiz Difficulty Selector

**File:** `frontend/src/components/student/quiz/Arena.tsx`  
**Time:** 1-2 hours  
**Impact:** High

### Current Code (No Difficulty Selection):
```typescript
export default function Arena() {
  // ... other state ...
  const [currentConceptId] = useState(1);

  const loadNextQuestion = async () => {
    setIsLoading(true);
    try {
      // ❌ PROBLEM: No difficulty parameter passed
      const question = await getRandomQuestion(currentConceptId);
      // Transform and set question...
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* ❌ NO difficulty selector UI */}
      <QuestionCard question={currentQuestion} />
    </div>
  );
}
```

### Fixed Code (With Difficulty Selection):
```typescript
export default function Arena() {
  // ... other state ...
  const [currentConceptId] = useState(1);
  // ✅ ADDED: Difficulty state
  const [difficulty, setDifficulty] = useState<1 | 2>(1);

  const loadNextQuestion = async () => {
    setIsLoading(true);
    try {
      // ✅ FIXED: Pass difficulty parameter
      const question = await getRandomQuestion(
        currentConceptId,
        difficulty  // Now includes difficulty
      );
      // Transform and set question...
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ✅ ADDED: Difficulty selector UI */}
      <div className="flex gap-4 justify-center mb-6">
        <button
          onClick={() => setDifficulty(1)}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            difficulty === 1
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          📚 Easy (Difficulty 1)
        </button>
        <button
          onClick={() => setDifficulty(2)}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            difficulty === 2
              ? "bg-orange-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          🔥 Hard (Difficulty 2)
        </button>
      </div>

      <QuestionCard question={currentQuestion} />
    </div>
  );
}
```

---

## 🎯 Fix #3: Add Error Toast Notifications

**File:** `frontend/src/lib/api.ts`  
**Time:** 1 hour  
**Impact:** Medium

### Current Code (Silent Failures):
```typescript
export const submitQuizAnswer = async (data: SubmitAnswerRequest) => {
  try {
    const response = await fetch(`${API_BASE}/api/quiz/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    // ❌ PROBLEM: Error only logged to console
    console.error("API Error:", error);
    // User sees nothing - silent failure!
  }
};
```

### Fixed Code (With Error Handling):
```typescript
// ✅ ADDED: Toast notification helper
interface ToastOptions {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

let toastCallback: ((options: ToastOptions) => void) | null = null;

export const setToastCallback = (callback: (options: ToastOptions) => void) => {
  toastCallback = callback;
};

const showToast = (options: ToastOptions) => {
  if (toastCallback) {
    toastCallback(options);
  } else {
    console.log(`[${options.type.toUpperCase()}] ${options.message}`);
  }
};

export const submitQuizAnswer = async (data: SubmitAnswerRequest) => {
  try {
    const response = await fetch(`${API_BASE}/api/quiz/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = response.json();
    
    // ✅ FIXED: Show success toast
    showToast({
      type: 'success',
      message: `✅ Answer submitted!`,
    });
    
    return result;
  } catch (error) {
    // ✅ FIXED: Show error toast to user
    const errorMsg = error instanceof Error 
      ? error.message 
      : "Failed to submit answer. Please try again.";
    
    showToast({
      type: 'error',
      message: errorMsg,
      duration: 4000,
    });
    
    // Still log for debugging
    console.error("API Error:", error);
    throw error;
  }
};
```

**In layout.tsx:**
```typescript
"use client";
import { StudentProvider } from "@/context/StudentContext";
import { setToastCallback } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import ToastContainer from "@/components/Toast";

export default function RootLayout({ children }: Props) {
  // ✅ Set up toast callback after client-side mount
  useEffect(() => {
    setToastCallback((options) => {
      // You'll need to create a Toast context/component
      // This is just the integration point
    });
  }, []);

  return (
    <html>
      <body>
        <StudentProvider>
          <Navbar />
          <ToastContainer />  {/* ✅ Add toast display component */}
          {children}
        </StudentProvider>
      </body>
    </html>
  );
}
```

---

## 🎯 Fix #4: Create /onboarding Route

**File:** `frontend/src/app/onboarding/page.tsx` (CREATE NEW)  
**Time:** 2-3 hours  
**Impact:** High

### New File - Create This:
```typescript
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStudent } from "@/context/StudentContext";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

export default function OnboardingPage() {
  const router = useRouter();
  const { student } = useStudent();

  // ✅ Only show onboarding if just registered (not finished)
  useEffect(() => {
    if (!student) {
      router.push("/login");
    }
    
    // Check if already completed onboarding
    const onboardingCompleted = localStorage.getItem(
      `onboarding_${student?.id}`
    );
    
    if (onboardingCompleted) {
      router.push("/dashboard");
    }
  }, [student, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto">
        {/* ✅ Use the existing OnboardingWizard component */}
        <OnboardingWizard
          onComplete={(wizardData) => {
            // Send to backend
            saveOnboardingData(student.id, wizardData);
            
            // Mark as completed
            localStorage.setItem(
              `onboarding_${student?.id}`,
              JSON.stringify(wizardData)
            );
            
            // Redirect to dashboard
            router.push("/dashboard");
          }}
        />
      </div>
    </div>
  );
}

async function saveOnboardingData(
  studentId: number,
  wizardData: OnboardingData
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/student/${studentId}/onboarding`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wizardData),
      }
    );
    
    if (!response.ok) {
      throw new Error("Failed to save onboarding data");
    }
  } catch (error) {
    console.error("Onboarding save error:", error);
    // Don't block user - they can continue anyway
  }
}
```

**In register/page.tsx, change redirect:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // ... registration code ...
  
  if (response.ok) {
    storeSession({ ... });
    
    // ✅ CHANGED: Redirect to onboarding instead of dashboard
    router.push("/onboarding");  // WAS: router.push("/dashboard");
  }
};
```

---

## 🎯 Fix #5: Make MissionControl Dynamic

**File:** `frontend/src/components/student/dashboard/MissionControl.tsx`  
**Time:** 3-4 hours  
**Impact:** Medium

### Current Code (Hardcoded):
```typescript
export default function MissionControl() {
  // ❌ PROBLEM: Hardcoded props
  return (
    <div>
      <h2>Today's Mission</h2>
      <p>Review Fractions and Angles</p>
      <div>Reward: +50 XP</div>
    </div>
  );
}
```

### Fixed Code (Dynamic):
```typescript
"use client";
import { useState, useEffect } from "react";

interface Mission {
  id: number;
  title: string;
  description: string;
  rewardXp: number;
  conceptIds: number[];
  isCompleted: boolean;
}

export default function MissionControl({
  studentId,
}: {
  studentId: number;
}) {
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ ADDED: Fetch mission on mount
  useEffect(() => {
    const fetchMission = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/mission/today/${studentId}`
        );
        
        if (!response.ok) throw new Error("Failed to fetch mission");
        
        const data = await response.json();
        setMission(data);
      } catch (error) {
        console.error("Mission fetch error:", error);
        // Show default mission on error
        setMission({
          id: 0,
          title: "Today's Challenge",
          description: "Take 3 quizzes to earn XP",
          rewardXp: 30,
          conceptIds: [],
          isCompleted: false,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMission();
  }, [studentId]);

  if (loading) {
    return <div className="animate-pulse bg-gray-300 h-48 rounded-lg" />;
  }

  if (!mission) return null;

  return (
    <div
      className={`
        rounded-2xl shadow-xl p-8 text-white
        ${
          mission.isCompleted
            ? "bg-gradient-to-br from-green-400 to-green-600"
            : "bg-gradient-to-br from-blue-500 to-purple-600"
        }
      `}
    >
      {mission.isCompleted ? (
        <>
          <h2 className="text-4xl font-bold mb-2">✓ Mission Accomplished!</h2>
          <p className="text-lg opacity-95">Come back tomorrow for a new mission</p>
        </>
      ) : (
        <>
          {/* ✅ FIXED: Dynamic content */}
          <h2 className="text-4xl font-bold mb-2">{mission.title}</h2>
          <p className="text-lg opacity-95 mb-6">{mission.description}</p>

          <div className="inline-block bg-white bg-opacity-20 px-4 py-2 rounded-full">
            <p className="text-sm font-semibold">
              Reward: <span className="text-yellow-300">+{mission.rewardXp} XP</span>
            </p>
          </div>

          <button
            onClick={() => {
              // Navigate to quiz for mission
              // Could target first concept in conceptIds
            }}
            className="mt-6 px-8 py-4 font-bold text-lg rounded-xl
              bg-white text-purple-600 hover:scale-105 transition-transform"
          >
            Start Mission →
          </button>
        </>
      )}
    </div>
  );
}
```

**Backend Route Needed (Python):**
```python
# backend/app/api/routes/mission.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter()

@router.get("/today/{student_id}")
async def get_today_mission(student_id: int, db: Session = Depends(get_db)):
    """Get today's mission for student"""
    # TODO: Create MissionService
    # TODO: Implement mission generation logic
    # For now, return sample mission
    return {
        "id": 1,
        "title": "Master Linear Equations",
        "description": "Answer 5 questions on linear equations",
        "rewardXp": 50,
        "conceptIds": [1, 2, 3],
        "isCompleted": False,
    }
```

---

## 🎯 Fix #6: Enable Streak Celebrations

**File:** `frontend/src/components/student/dashboard/StreakCounter.tsx`  
**Time:** 1-2 hours  
**Impact:** Medium

### Current Code (Plain Display):
```typescript
export default function StreakCounter({
  currentStreak,
  bestStreak,
}: Props) {
  return (
    <div>
      <div className="text-4xl">🔥</div>
      <p className="text-2xl font-bold">{currentStreak}</p>
      <p className="text-sm text-gray-600">day streak</p>
    </div>
  );
}
```

### Fixed Code (With Celebrations):
```typescript
"use client";
import { useState, useEffect } from "react";
import Confetti from "react-confetti";

interface StreakMilestone {
  days: number;
  emoji: string;
  title: string;
}

const MILESTONES: StreakMilestone[] = [
  { days: 7, emoji: "🌟", title: "Week Warrior!" },
  { days: 14, emoji: "🚀", title: "Fortnight Force!" },
  { days: 30, emoji: "👑", title: "Monthly Monarch!" },
];

export default function StreakCounter({
  currentStreak,
  bestStreak,
  studentId,
}: Props) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [milestone, setMilestone] = useState<StreakMilestone | null>(null);

  // ✅ ADDED: Detect milestones
  useEffect(() => {
    const lastChecked = localStorage.getItem(
      `streak_check_${studentId}`
    );
    const today = new Date().toDateString();

    // Only check once per day
    if (lastChecked !== today) {
      const achievedMilestone = MILESTONES.find(
        (m) => currentStreak === m.days
      );

      if (achievedMilestone) {
        setMilestone(achievedMilestone);
        setShowCelebration(true);
        
        // Play sound effect
        playSound("victory");
        
        localStorage.setItem(`streak_check_${studentId}`, today);

        // Auto-hide after 5 seconds
        setTimeout(() => setShowCelebration(false), 5000);
      }
    }
  }, [currentStreak, studentId]);

  return (
    <>
      {showCelebration && (
        <>
          <Confetti numberOfPieces={100} recycle={false} />
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center
              z-50 animate-fade-in"
          >
            <div
              className="bg-white rounded-2xl p-12 text-center
                scale-0 animate-bounce-in"
            >
              <div className="text-6xl mb-4">{milestone?.emoji}</div>
              <h2 className="text-3xl font-bold mb-2">
                {milestone?.title}
              </h2>
              <p className="text-gray-600 text-lg">
                {currentStreak} day streak! Keep it up! 🎉
              </p>
            </div>
          </div>
        </>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="text-4xl mb-2">🔥</div>
        <p className="text-2xl font-bold text-orange-600">
          {currentStreak}
        </p>
        <p className="text-sm text-gray-600">current streak</p>
        <p className="text-xs text-gray-500 mt-2">
          Best: {bestStreak} days
        </p>
      </div>
    </>
  );
}

function playSound(type: string) {
  // Add sound effect (optional - can use Web Audio API)
  const audioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)();
  
  if (type === "victory") {
    // Play a simple victory sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5
    );
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }
}
```

---

## ✅ Summary of Fixes

| Fix # | Component | Time | Complexity | Impact |
|-------|-----------|------|-----------|--------|
| 1 | SubjectMap → Real Data | 1-2 hrs | Low | Medium |
| 2 | Quiz Difficulty | 1-2 hrs | Low | High |
| 3 | Error Toast | 1 hr | Low | Medium |
| 4 | Onboarding Route | 2-3 hrs | Medium | High |
| 5 | Dynamic Missions | 3-4 hrs | Medium | Medium |
| 6 | Streak Celebrations | 1-2 hrs | Low | Medium |

**Total Time for All Fixes:** 9-14 hours  
**Total Time for Remaining (Parent, etc.):** 10-15 hours  
**Grand Total:** 19-29 hours

---

**Last Updated:** December 25, 2025
