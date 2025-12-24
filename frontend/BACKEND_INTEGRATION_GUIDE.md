# frontend/BACKEND_INTEGRATION_GUIDE.md

# 🔗 Frontend-Backend Integration Guide

## Quick Start: Connect Your Components to API

### 1. Setup API Client

Create a new file: `frontend/src/utils/api.ts`

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = {
  async request(method: string, endpoint: string, data?: any) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'API Error');
    }
    
    return response.json();
  },

  // Quiz Endpoints
  quiz: {
    submitAnswer: (data: {
      question_id: number;
      student_id: number;
      selected_option: string;
      time_taken_seconds?: number;
    }) => apiClient.request('POST', '/api/quiz/submit', data),
    
    getQuestion: (questionId: number) =>
      apiClient.request('GET', `/api/quiz/question/${questionId}`),
    
    getRandomQuestion: (conceptId: number, difficulty: number = 2) =>
      apiClient.request('GET', `/api/quiz/random/${conceptId}?difficulty=${difficulty}`)
  },

  // Student Endpoints
  student: {
    getProfile: (studentId: number) =>
      apiClient.request('GET', `/api/student/${studentId}`),
    
    getProgress: (studentId: number) =>
      apiClient.request('GET', `/api/student/${studentId}/progress`),
    
    getStreak: (studentId: number) =>
      apiClient.request('GET', `/api/student/${studentId}/streak`),
    
    getConceptMastery: (studentId: number, conceptId: number) =>
      apiClient.request('GET', `/api/student/concept/${conceptId}/mastery?student_id=${studentId}`)
  },

  // Auth Endpoints
  auth: {
    registerStudent: (data: {
      email: string;
      password: string;
      name: string;
      grade_level: number;
    }) => apiClient.request('POST', '/api/auth/register/student', data),
    
    login: (email: string, password: string) =>
      apiClient.request('POST', '/api/auth/login', { email, password }),
    
    registerParent: (data: {
      email: string;
      password: string;
      name: string;
    }) => apiClient.request('POST', '/api/auth/register/parent', data)
  },

  // Progress Endpoints
  progress: {
    getStudentDashboard: (studentId: number) =>
      apiClient.request('GET', `/api/progress/student/${studentId}`)
  }
};
```

---

## 2. Arena Component (Quiz Display)

Update: `frontend/src/components/student/quiz/Arena.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/utils/api';
import { QuestionCard } from './QuestionCard';
import { QuizProgress } from './QuizProgress';
import { FeedbackOverlay } from './FeedbackOverlay';

interface Question {
  id: number;
  conceptId: number;
  difficultyLevel: number;
  content: {
    text: string;
    options: Record<string, string>;
    hint?: string;
    image?: string;
  };
  explanation: string;
}

interface Feedback {
  isCorrect: boolean;
  xpEarned: number;
  explanation: string;
  conceptMasteryScore: number;
  conceptLeitnerBox: number;
  chapterMasteryScore: number;
  totalXp: number;
  nextReviewDate: string;
}

export default function Arena() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const studentId = 1; // TODO: Get from session/auth
  const conceptId = 1; // TODO: Get from chapter context

  useEffect(() => {
    loadQuestion();
  }, []);

  const loadQuestion = async () => {
    try {
      setLoading(true);
      setShowFeedback(false);
      setSelectedAnswer(null);
      
      const data = await apiClient.quiz.getRandomQuestion(conceptId, 2);
      setQuestion(data);
    } catch (error) {
      console.error('Failed to load question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (answer: string) => {
    if (!question) return;
    
    setSelectedAnswer(answer);
    
    try {
      const startTime = Date.now();
      
      const result = await apiClient.quiz.submitAnswer({
        question_id: question.id,
        student_id: studentId,
        selected_option: answer,
        time_taken_seconds: Math.floor((Date.now() - startTime) / 1000)
      });
      
      setFeedback({
        isCorrect: result.is_correct,
        xpEarned: result.xp_earned,
        explanation: result.explanation,
        conceptMasteryScore: result.concept_mastery_score,
        conceptLeitnerBox: result.concept_leitner_box,
        chapterMasteryScore: result.chapter_mastery_score,
        totalXp: result.total_xp,
        nextReviewDate: result.next_review_date
      });
      
      setShowFeedback(true);
      
      // Load next question after 3 seconds
      setTimeout(() => {
        loadQuestion();
      }, 3000);
      
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <QuizProgress 
        masteryScore={feedback?.conceptMasteryScore ?? 0}
        leitnerBox={feedback?.conceptLeitnerBox ?? 1}
      />
      
      {question && (
        <QuestionCard
          question={question}
          selectedAnswer={selectedAnswer}
          onSelectAnswer={handleSubmitAnswer}
          disabled={showFeedback}
        />
      )}
      
      {showFeedback && feedback && (
        <FeedbackOverlay
          feedback={feedback}
          selectedAnswer={selectedAnswer}
        />
      )}
    </div>
  );
}
```

---

## 3. MissionControl Dashboard

Update: `frontend/src/components/student/dashboard/MissionControl.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/utils/api';
import { SubjectMap } from './SubjectMap';
import { StreakCounter } from './StreakCounter';

interface Chapter {
  id: number;
  name: string;
  masteryScore: number;
  questionsCompleted: number;
  questionsCorrect: number;
  status: 'locked' | 'unlocked';
}

interface Progress {
  studentId: number;
  name: string;
  totalXp: number;
  currentStreak: number;
  bestStreak: number;
  chapters: Chapter[];
}

export default function MissionControl() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  
  const studentId = 1; // TODO: Get from session

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const data = await apiClient.student.getProgress(studentId);
        setProgress({
          studentId: data.student_id,
          name: data.name,
          totalXp: data.total_xp,
          currentStreak: data.current_streak,
          bestStreak: data.best_streak,
          chapters: data.chapters.map((ch: any) => ({
            id: ch.id,
            name: ch.name,
            masteryScore: ch.mastery_score,
            questionsCompleted: ch.questions_completed,
            questionsCorrect: ch.questions_correct,
            status: ch.status
          }))
        });
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadProgress, 30000);
    return () => clearInterval(interval);
  }, [studentId]);

  if (loading) return <div>Loading dashboard...</div>;
  if (!progress) return <div>Failed to load progress</div>;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Welcome, {progress.name}! 🎮
          </h1>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total XP</div>
            <div className="text-3xl font-bold text-yellow-500">
              ⭐ {progress.totalXp}
            </div>
          </div>

          <StreakCounter
            current={progress.currentStreak}
            best={progress.bestStreak}
          />

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Chapters Unlocked</div>
            <div className="text-3xl font-bold text-purple-500">
              {progress.chapters.filter(ch => ch.status === 'unlocked').length}
            </div>
          </div>
        </div>

        {/* Subject Map */}
        <SubjectMap chapters={progress.chapters} />
      </div>
    </div>
  );
}
```

---

## 4. WeaknessRadar (Parent Dashboard)

Update: `frontend/src/components/parent/dashboard/WeaknessRadar.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/utils/api';
import { RadarChart } from 'recharts';

interface ChapterData {
  name: string;
  mastery: number;
  questionsAnswered: number;
}

export default function WeaknessRadar({ childId }: { childId: number }) {
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const progress = await apiClient.student.getProgress(childId);
        
        const data = progress.chapters.map((ch: any) => ({
          name: ch.name,
          mastery: ch.mastery_score,
          questionsAnswered: ch.questions_completed
        }));
        
        setChapters(data);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [childId]);

  if (loading) return <div>Loading...</div>;

  // Identify weaknesses (< 50% mastery)
  const weaknesses = chapters.filter(ch => ch.mastery < 50);
  const strengths = chapters.filter(ch => ch.mastery >= 80);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Learning Analytics</h2>

      {weaknesses.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 rounded border border-red-200">
          <h3 className="font-semibold text-red-700 mb-2">⚠️ Areas Needing Help</h3>
          {weaknesses.map(ch => (
            <div key={ch.name} className="text-sm text-red-600">
              {ch.name}: {ch.mastery.toFixed(1)}% mastery
            </div>
          ))}
        </div>
      )}

      {strengths.length > 0 && (
        <div className="mb-6 p-4 bg-green-50 rounded border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">✨ Areas of Strength</h3>
          {strengths.map(ch => (
            <div key={ch.name} className="text-sm text-green-600">
              {ch.name}: {ch.mastery.toFixed(1)}% mastery
            </div>
          ))}
        </div>
      )}

      {/* Radar Chart Component */}
      <RadarChart data={chapters} />
    </div>
  );
}
```

---

## 5. Environment Configuration

Create: `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=EdTech MVP
```

---

## 6. Error Handling Pattern

For all components:

```typescript
const handleApiCall = async () => {
  try {
    const data = await apiClient.quiz.getRandomQuestion(conceptId);
    // Success
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('404')) {
        // Not found - show friendly message
        showErrorModal('Question not found. Please try again.');
      } else if (error.message.includes('401')) {
        // Unauthorized - redirect to login
        router.push('/login');
      } else {
        // Generic error
        showErrorModal('Something went wrong. Please try again.');
      }
    }
  }
};
```

---

## 7. Testing API Calls

### Using Browser DevTools

1. Open DevTools (F12)
2. Go to Network tab
3. Perform action in app
4. Check request/response

### Using Postman

1. Import API endpoints
2. Test each endpoint manually
3. Verify response format

### Using cURL

```bash
# Test submission
curl -X POST http://localhost:8000/api/quiz/submit \
  -H "Content-Type: application/json" \
  -d '{
    "question_id": 1,
    "student_id": 1,
    "selected_option": "C",
    "time_taken_seconds": 15
  }'

# Get progress
curl http://localhost:8000/api/student/1/progress
```

---

## 8. Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS error | Ensure BACKEND_URL is correct and backend has CORS enabled |
| 404 on API call | Check endpoint spelling and HTTP method (GET vs POST) |
| 422 validation error | Verify request data matches schema (check Network tab) |
| Token not persisted | Ensure localStorage is enabled in browser |
| API returns 500 | Check backend terminal for error logs |

---

## 9. Data Flow Checklist

- [x] Question loads from `/api/quiz/random`
- [x] Answer submitted to `/api/quiz/submit`
- [x] Feedback displayed (is_correct, xp_earned, etc.)
- [x] Progress updated on `/api/student/progress`
- [x] Mastery score visible in dashboard
- [x] Streak counter updated
- [x] Parent can see all chapters

---

## 10. Performance Tips

1. **Cache questions locally** - Don't reload same question twice
2. **Debounce API calls** - Use `useCallback` with dependencies
3. **Pagination** - Load chapters in batches
4. **Lazy load images** - Use `next/image` with lazy loading
5. **Minimize re-renders** - Use `React.memo` for components

---

**You're all set!** 🚀 Start integrating your components with the backend API.
