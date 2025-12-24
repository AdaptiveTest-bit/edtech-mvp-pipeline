# 🚀 FRONTEND INTEGRATION PLAN

**Date:** 24 December 2025  
**Status:** Ready for frontend-backend integration  
**Backend API:** Running on port 8000 ✅  
**Database:** PostgreSQL with sample data ✅

---

## 📋 FRONTEND CURRENT STATE

### **What Exists:**
- ✅ Quiz Arena UI (hardcoded questions)
- ✅ Question Card component
- ✅ Feedback Overlay
- ✅ Quiz Progress tracker
- ✅ Next.js + TypeScript + Tailwind setup

### **What's Missing:**
- ❌ API client for backend communication
- ❌ Authentication (login/register UI)
- ❌ Student dashboard
- ❌ Student context/state management
- ❌ Routing between pages
- ❌ Navigation/header
- ❌ Session management

---

## 🎯 INTEGRATION ROADMAP

### **PHASE 1: API & State Management (1-2 hours)**

#### **Step 1.1: Create API Client**
File: `frontend/src/lib/api.ts`

```typescript
export const API_BASE = "http://localhost:8000";

export interface Question {
  id: number;
  concept_id: number;
  content: {
    text: string;
    options: { [key: string]: string }; // { "A": "...", "B": "...", etc }
    hint?: string;
  };
  difficulty_level: number;
  correct_option_key: string;
  explanation: string;
}

export interface SubmitAnswerResponse {
  is_correct: boolean;
  xp_earned: number;
  explanation: string;
  concept_mastery_score: number;
  concept_leitner_box: number;
  chapter_mastery_score: number;
  total_xp: number;
  next_review_date: string;
}

export interface StudentProgress {
  student_id: number;
  name: string;
  email: string;
  total_xp: number;
  current_streak: number;
  best_streak: number;
  chapters: Array<{
    chapter_id: number;
    name: string;
    mastery_score: number;
    questions_completed: number;
    questions_correct: number;
    status: "locked" | "unlocked" | "mastered";
  }>;
}

// Authentication
export async function registerStudent(
  email: string,
  password: string,
  name: string,
  gradeLevel?: number
) {
  const res = await fetch(`${API_BASE}/api/auth/register/student`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name, grade_level: gradeLevel }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Quiz
export async function fetchQuestion(questionId: number) {
  const res = await fetch(`${API_BASE}/api/quiz/question/${questionId}`);
  if (!res.ok) throw new Error("Failed to fetch question");
  return res.json();
}

export async function getRandomQuestion(conceptId: number) {
  const res = await fetch(`${API_BASE}/api/quiz/random/${conceptId}`);
  if (!res.ok) throw new Error("Failed to fetch random question");
  return res.json();
}

export async function submitAnswer(
  questionId: number,
  studentId: number,
  selectedOption: string,
  timeTakenSeconds: number
): Promise<SubmitAnswerResponse> {
  const res = await fetch(`${API_BASE}/api/quiz/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question_id: questionId,
      student_id: studentId,
      selected_option: selectedOption,
      time_taken_seconds: timeTakenSeconds,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Student
export async function getStudentProgress(
  studentId: number
): Promise<StudentProgress> {
  const res = await fetch(`${API_BASE}/api/student/${studentId}/progress`);
  if (!res.ok) throw new Error("Failed to fetch progress");
  return res.json();
}

export async function getStudentStreak(studentId: number) {
  const res = await fetch(`${API_BASE}/api/student/${studentId}/streak`);
  if (!res.ok) throw new Error("Failed to fetch streak");
  return res.json();
}
```

#### **Step 1.2: Create Student Context**
File: `frontend/src/context/StudentContext.tsx`

```typescript
"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface StudentSession {
  id: number;
  email: string;
  name: string;
  token: string;
}

interface StudentContextType {
  student: StudentSession | null;
  isLoading: boolean;
  login: (session: StudentSession) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<StudentSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("student");
    if (stored) {
      try {
        setStudent(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem("student");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (session: StudentSession) => {
    setStudent(session);
    localStorage.setItem("student", JSON.stringify(session));
  };

  const logout = () => {
    setStudent(null);
    localStorage.removeItem("student");
  };

  return (
    <StudentContext.Provider
      value={{
        student,
        isLoading,
        login,
        logout,
        isAuthenticated: student !== null,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error("useStudent must be used within StudentProvider");
  }
  return context;
}
```

---

### **PHASE 2: Update Quiz Arena Component (1 hour)**

File: `frontend/src/components/student/quiz/Arena.tsx`

```typescript
"use client";
import { useState, useEffect } from "react";
import { getRandomQuestion, submitAnswer, Question, SubmitAnswerResponse } from "@/lib/api";
import { useStudent } from "@/context/StudentContext";
import QuestionCard from "./QuestionCard";
import FeedbackOverlay from "./FeedbackOverlay";
import QuizProgress from "./QuizProgress";

export default function Arena() {
  const { student, isLoading } = useStudent();
  const [question, setQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<SubmitAnswerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      if (!student) {
        // Redirect to login
        window.location.href = "/login";
      } else {
        loadQuestion();
      }
    }
  }, [student, isLoading]);

  const loadQuestion = async () => {
    try {
      setLoading(true);
      // TODO: Get concept_id from URL params or dropdown
      const data = await getRandomQuestion(1);
      setQuestion(data);
      setFeedback(null);
    } catch (error) {
      console.error("Failed to load question:", error);
      // Show error toast/message
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (selectedOption: string, timeTaken: number) => {
    if (!question || !student) return;

    try {
      const result = await submitAnswer(
        question.id,
        student.id,
        selectedOption,
        timeTaken
      );
      setFeedback(result);
      setQuestionsAnswered((prev) => prev + 1);
      if (result.is_correct) {
        setCorrectAnswers((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
      // Show error toast
    }
  };

  const handleNext = () => {
    loadQuestion();
  };

  if (isLoading || loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!question) {
    return <div className="flex items-center justify-center h-screen">No question available</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <QuizProgress
          answered={questionsAnswered}
          correct={correctAnswers}
          currentStreak={student?.current_streak || 0}
        />

        {!feedback ? (
          <QuestionCard question={question} onSubmit={handleSubmit} />
        ) : (
          <FeedbackOverlay feedback={feedback} onNext={handleNext} />
        )}
      </div>
    </div>
  );
}
```

---

### **PHASE 3: Authentication Pages (2 hours)**

#### **Step 3.1: Login Page**
File: `frontend/src/app/login/page.tsx`

```typescript
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { useStudent } from "@/context/StudentContext";

export default function LoginPage() {
  const router = useRouter();
  const { login: setStudent } = useStudent();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(email, password);
      setStudent({
        id: response.id,
        email: response.email,
        name: response.name,
        token: response.token,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Login</h1>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
```

#### **Step 3.2: Register Page**
File: `frontend/src/app/register/page.tsx`

Similar structure to login page, but calls `registerStudent()` instead.

---

### **PHASE 4: Dashboard Page (1.5 hours)**

File: `frontend/src/app/dashboard/page.tsx`

```typescript
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStudent } from "@/context/StudentContext";
import { getStudentProgress, StudentProgress } from "@/lib/api";

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
        const data = await getStudentProgress(student.id);
        setProgress(data);
      } catch (error) {
        console.error("Failed to fetch progress:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [student, router]);

  if (loading || !progress) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Welcome, {progress.name}!</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{progress.total_xp}</div>
            <div className="text-gray-600">Total XP</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{progress.current_streak}</div>
            <div className="text-gray-600">Current Streak</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">{progress.best_streak}</div>
            <div className="text-gray-600">Best Streak</div>
          </div>
        </div>

        {/* Chapters */}
        <h2 className="text-2xl font-bold mb-4">Chapters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {progress.chapters.map((chapter) => (
            <div key={chapter.chapter_id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-lg">{chapter.name}</h3>
              <div className="mt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Mastery:</span>
                  <span>{chapter.mastery_score.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${chapter.mastery_score}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                {chapter.questions_correct} / {chapter.questions_completed} correct
              </div>
              <div className="mt-2 text-xs font-semibold">
                <span
                  className={
                    chapter.status === "mastered"
                      ? "text-green-600"
                      : chapter.status === "unlocked"
                      ? "text-blue-600"
                      : "text-gray-600"
                  }
                >
                  {chapter.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Start Quiz Button */}
        <button
          onClick={() => router.push("/quiz")}
          className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
}
```

---

### **PHASE 5: Layout & Navigation (1 hour)**

#### **Step 5.1: Update Root Layout**
File: `frontend/src/app/layout.tsx`

```typescript
import type { Metadata } from "next";
import { StudentProvider } from "@/context/StudentContext";
import Navbar from "@/components/common/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "EdTech MVP - Master Skills Through Spaced Repetition",
  description: "Learn math concepts using AI-powered spaced repetition",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StudentProvider>
          <Navbar />
          {children}
        </StudentProvider>
      </body>
    </html>
  );
}
```

#### **Step 5.2: Create Navbar Component**
File: `frontend/src/components/common/Navbar.tsx`

```typescript
"use client";
import { useStudent } from "@/context/StudentContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { student, logout, isAuthenticated } = useStudent();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="font-bold text-xl text-blue-600">
          EdTech MVP
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/quiz" className="text-gray-700 hover:text-blue-600">
                Quiz
              </Link>
              <span className="text-gray-600">{student?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-700 hover:text-blue-600">
                Login
              </Link>
              <Link href="/register" className="text-gray-700 hover:text-blue-600">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
```

---

## 📁 NEW FILE STRUCTURE

After integration, frontend will look like:

```
frontend/src/
├── app/
│   ├── layout.tsx                   (Updated with StudentProvider & Navbar)
│   ├── globals.css
│   ├── page.tsx                     (Home/redirect to dashboard if logged in)
│   ├── login/
│   │   └── page.tsx                 (NEW)
│   ├── register/
│   │   └── page.tsx                 (NEW)
│   ├── dashboard/
│   │   └── page.tsx                 (NEW)
│   └── quiz/
│       └── page.tsx                 (NEW - route to Arena)
├── components/
│   ├── common/
│   │   ├── Navbar.tsx               (NEW)
│   │   ├── SideMenu.tsx             (For future use)
│   │   └── UserProfile.tsx          (For future use)
│   └── student/
│       ├── dashboard/               (For future expansion)
│       └── quiz/
│           ├── Arena.tsx            (Updated with API)
│           ├── QuestionCard.tsx     (Keep as is)
│           ├── FeedbackOverlay.tsx  (Keep as is)
│           ├── QuizProgress.tsx     (Keep as is)
│           └── Options.tsx          (Keep as is)
├── context/
│   └── StudentContext.tsx           (NEW)
└── lib/
    └── api.ts                       (NEW)
```

---

## 🔗 ROUTING MAP

After integration:

```
/                    → Redirect to /dashboard (if logged in) or /login (if not)
/login               → Login form
/register            → Registration form
/dashboard           → Student progress overview
/quiz                → Quiz Arena with live API integration
/quiz/:conceptId     → Quiz for specific concept (future)
```

---

## ✅ TESTING CHECKLIST

### **Backend API Testing (BEFORE frontend)**
```bash
# 1. Start backend
cd backend && python main.py

# 2. Test health
curl http://localhost:8000/health

# 3. Test quiz question fetch
curl http://localhost:8000/api/quiz/question/1

# 4. Test answer submission
curl -X POST http://localhost:8000/api/quiz/submit \
  -H "Content-Type: application/json" \
  -d '{"question_id": 1, "student_id": 1, "selected_option": "B", "time_taken_seconds": 15}'

# 5. Test progress fetch
curl http://localhost:8000/api/student/1/progress
```

### **Frontend Testing (AFTER API integration)**
```bash
# 1. Start frontend
cd frontend && npm run dev

# 2. Open http://localhost:3000

# 3. Test login with sample student:
#    - Email: alice@example.com
#    - Password: (check database or backend logs)

# 4. Test quiz submission
#    - Select an option
#    - Verify feedback from backend
#    - Check if XP and mastery updated

# 5. Test dashboard
#    - Verify progress displays from API
#    - Check chapter mastery scores
#    - Verify streak display
```

---

## 🎯 IMPLEMENTATION TIMELINE

| Phase | Task | Duration | Status |
|-------|------|----------|--------|
| 1 | API Client + Context | 1-2h | 📝 Ready to implement |
| 2 | Update Arena component | 1h | 📝 Ready to implement |
| 3 | Auth pages (Login/Register) | 2h | 📝 Ready to implement |
| 4 | Dashboard page | 1.5h | 📝 Ready to implement |
| 5 | Navigation & Layout | 1h | 📝 Ready to implement |
| - | **TOTAL** | **6.5h** | ⏳ Start now |

---

## 🚨 IMPORTANT NOTES

### **CORS is Already Enabled**
Backend has CORS enabled for localhost:3000 in `app/__init__.py`.

### **Backend Running Checks**
Always ensure backend is running on port 8000 before testing frontend:
```bash
curl http://localhost:8000/health
```

### **Database Population**
Sample data is already inserted (students, questions, etc.) from `database/DML/01_sample_data.sql`.

### **No Database Changes Needed**
Do NOT modify DDL or add migrations. Only update backend/frontend code.

---

**Generated:** 24 December 2025  
**Status:** Ready for frontend implementation  
**Next:** Start with Phase 1 (API client)  
**Estimated Completion:** Today (6-8 hours of coding)
