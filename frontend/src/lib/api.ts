/**
 * API Client for EdTech Backend
 * 
 * This module provides typed functions for all backend endpoints.
 * All functions include error handling and return typed responses.
 * 
 * Backend URL: http://localhost:8000 (port from backend/app/core/config.py)
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

export const API_BASE = "http://localhost:8000";

// Set to false in production
const DEBUG = true;

const log = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[API] ${message}`, data || "");
  }
};

// ============================================================================
// TYPES
// ============================================================================

/**
 * Question structure matching backend schema
 * (from curriculum.questions table)
 */
export interface Question {
  id: number;
  concept_id: number;
  content: {
    text: string;
    options: {
      A: string;
      B: string;
      C: string;
      D: string;
    };
    hint?: string;
  };
  difficulty_level: number;
  correct_option_key: string; // "A", "B", "C", or "D"
  explanation: string;
}

/**
 * Response after submitting an answer
 * (from analytics.quiz_submissions and mastery calculation)
 */
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

/**
 * Student profile from users.students table
 */
export interface StudentProfile {
  id: number;
  user_id: string;
  email: string;
  name: string;
  grade_level: number | null;
  total_xp: number;
  current_streak: number;
  best_streak: number;
  avatar_url: string | null;
}

/**
 * Chapter progress for a student
 * (from analytics.student_progress joined with curriculum.chapters)
 */
export interface ChapterProgress {
  chapter_id: number;
  name: string;
  mastery_score: number; // 0-100 (percentage)
  questions_completed: number;
  questions_correct: number;
  status: "locked" | "unlocked" | "mastered";
}

/**
 * Complete student progress response
 * (aggregated from multiple tables)
 */
export interface StudentProgress {
  student_id: number;
  name: string;
  email: string;
  total_xp: number;
  current_streak: number;
  best_streak: number;
  chapters: ChapterProgress[];
}

/**
 * Streak information for student
 */
export interface StreakInfo {
  student_id: number;
  current_streak: number;
  best_streak: number;
  total_xp: number;
  last_activity_date?: string;
  days_consecutive?: number;
}

/**
 * Login/Register response with authentication token
 */
export interface AuthResponse {
  id: number;
  email: string;
  name: string;
  user_id: string;
  token: string;
  token_type: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Helper to handle API responses
 * Throws descriptive errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  log(`Response status: ${response.status}`);
  
  if (!response.ok) {
    const error = await response.text();
    log(`Error response: ${error}`);
    throw new Error(`API Error ${response.status}: ${error}`);
  }

  const data = await response.json() as T;
  log(`Response data:`, data);
  return data;
}

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

/**
 * Register a new student
 * 
 * POST /api/auth/register/student
 * 
 * Database: Inserts into users.students
 * Returns: { id, email, name, user_id, token, token_type }
 */
export async function registerStudent(
  email: string,
  password: string,
  name: string,
  gradeLevel?: number
): Promise<AuthResponse> {
  log(`Registering student: ${email}`);

  const response = await fetch(`${API_BASE}/api/auth/register/student`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      name,
      grade_level: gradeLevel,
    }),
  });

  return handleResponse<AuthResponse>(response);
}

/**
 * Login student
 * 
 * POST /api/auth/login
 * 
 * Database: Queries users.students table
 * Returns: { id, email, name, user_id, token, token_type }
 */
export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  log(`Logging in: ${email}`);

  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return handleResponse<AuthResponse>(response);
}

// ============================================================================
// QUIZ ENDPOINTS
// ============================================================================

/**
 * Get a specific question by ID
 * 
 * GET /api/quiz/question/{question_id}
 * 
 * Database: Queries curriculum.questions by id
 * Returns: Question object with content (JSON), options, explanation
 */
export async function fetchQuestion(questionId: number): Promise<Question> {
  log(`Fetching question: ${questionId}`);

  const response = await fetch(`${API_BASE}/api/quiz/question/${questionId}`);
  return handleResponse<Question>(response);
}

/**
 * Get random question for a concept (for spaced repetition)
 * 
 * GET /api/quiz/random/{concept_id}
 * 
 * Database: 
 *   1. Queries curriculum.concepts to find related questions
 *   2. Uses analytics.student_mastery to check Leitner box
 *   3. Returns random question for review
 * Returns: Question object
 */
export async function getRandomQuestion(
  conceptId: number,
  difficulty?: number
): Promise<Question> {
  const difficultyParam = difficulty ? `?difficulty=${difficulty}` : "";
  log(`Fetching random question for concept: ${conceptId}, difficulty: ${difficulty || "any"}`);

  const response = await fetch(
    `${API_BASE}/api/quiz/random/${conceptId}${difficultyParam}`
  );
  return handleResponse<Question>(response);
}

/**
 * Submit an answer to a question
 * 
 * POST /api/quiz/submit
 * 
 * Database:
 *   1. Inserts into analytics.attempts
 *   2. Updates analytics.student_mastery (EMA + Leitner box)
 *   3. Updates users.students (XP, streak)
 *   4. Updates analytics.student_progress (chapter mastery)
 *   5. Returns updated mastery info
 * 
 * Returns: SubmitAnswerResponse with updated scores
 */
export async function submitAnswer(
  questionId: number,
  studentId: number,
  selectedOption: string,
  timeTakenSeconds: number
): Promise<SubmitAnswerResponse> {
  log(`Submitting answer: Q${questionId} by student ${studentId}`);

  const response = await fetch(`${API_BASE}/api/quiz/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question_id: questionId,
      student_id: studentId,
      selected_option: selectedOption,
      time_taken_seconds: timeTakenSeconds,
    }),
  });

  return handleResponse<SubmitAnswerResponse>(response);
}

// ============================================================================
// STUDENT ENDPOINTS
// ============================================================================

/**
 * Get student profile
 * 
 * GET /api/student/{student_id}
 * 
 * Database: Queries users.students by id
 * Returns: StudentProfile with XP, streak, avatar, etc.
 */
export async function getStudentProfile(
  studentId: number
): Promise<StudentProfile> {
  log(`Fetching student profile: ${studentId}`);

  const response = await fetch(`${API_BASE}/api/student/${studentId}`);
  return handleResponse<StudentProfile>(response);
}

/**
 * Get student progress across all chapters
 * 
 * GET /api/student/{student_id}/progress
 * 
 * Database:
 *   1. Joins analytics.student_progress with curriculum.chapters
 *   2. Returns mastery score per chapter
 *   3. Calculates status (locked/unlocked/mastered)
 * Returns: StudentProgress with chapters array
 */
export async function getStudentProgress(
  studentId: number
): Promise<StudentProgress> {
  log(`Fetching student progress: ${studentId}`);

  const response = await fetch(
    `${API_BASE}/api/student/${studentId}/progress`
  );
  return handleResponse<StudentProgress>(response);
}

/**
 * Get student streak information
 * 
 * GET /api/student/{student_id}/streak
 * 
 * Database: Queries users.students for streak info
 * Returns: StreakInfo with current/best streak and last activity
 */
export async function getStudentStreak(
  studentId: number
): Promise<StreakInfo> {
  log(`Fetching student streak: ${studentId}`);

  const response = await fetch(`${API_BASE}/api/student/${studentId}/streak`);
  return handleResponse<StreakInfo>(response);
}

/**
 * Get student mastery for all concepts
 * 
 * GET /api/student/{student_id}/mastery
 * 
 * Database: Queries analytics.student_mastery for all concepts
 * Returns: Detailed mastery information per concept
 */
export async function getStudentMastery(studentId: number): Promise<any> {
  log(`Fetching student mastery: ${studentId}`);

  const response = await fetch(`${API_BASE}/api/student/${studentId}/mastery`);
  return handleResponse<any>(response);
}

// ============================================================================
// PROGRESS/ANALYTICS ENDPOINTS
// ============================================================================

/**
 * Get detailed analytics for a student
 * 
 * GET /api/progress/student/{student_id}
 * 
 * Database: Queries analytics.daily_analytics for detailed breakdown
 * Returns: Detailed analytics data
 */
export async function getStudentAnalytics(
  studentId: number
): Promise<any> {
  log(`Fetching student analytics: ${studentId}`);

  const response = await fetch(`${API_BASE}/api/progress/student/${studentId}`);
  return handleResponse<any>(response);
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Check if backend is running
 * Useful for debugging connection issues
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return response.ok;
  } catch (error) {
    console.error("Backend health check failed:", error);
    return false;
  }
}

/**
 * Get API documentation URL
 */
export function getApiDocsUrl(): string {
  return `${API_BASE}/docs`;
}

// ============================================================================
// ONBOARDING API
// ============================================================================

/**
 * Check if student has completed onboarding
 */
export async function getOnboardingStatus(studentId: number) {
  try {
    const url = `${API_BASE}/api/onboarding/status/${studentId}`;
    log(`Fetching onboarding status`, url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    log(`Onboarding status fetched`, data);
    return data;
  } catch (error) {
    console.error("Error fetching onboarding status:", error);
    throw error;
  }
}

/**
 * Save student's onboarding data
 */
export async function saveOnboarding(
  studentId: number,
  avatar: string,
  goals: Record<string, boolean>,
  baselineScore: number
) {
  try {
    const url = `${API_BASE}/api/onboarding/save?student_id=${studentId}`;
    log(`Saving onboarding data`, { avatar, goals, baselineScore });

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        avatar,
        goals,
        baseline_score: baselineScore,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    log(`Onboarding saved successfully`, data);
    return data;
  } catch (error) {
    console.error("Error saving onboarding:", error);
    throw error;
  }
}

// ============================================================================
// MISSIONS API
// ============================================================================

/**
 * Mission data structure
 */
export interface Mission {
  id: number;
  title: string;
  description: string;
  reward_xp: number;
  status: string;
  due_date: string;
}

/**
 * Get today's active mission for a student
 */
export async function getTodayMission(studentId: number) {
  try {
    const url = `${API_BASE}/api/missions/today/${studentId}`;
    log(`Fetching today's mission`, url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    log(`Today's mission fetched`, data);
    return data;
  } catch (error) {
    console.error("Error fetching today's mission:", error);
    // Graceful degradation - return empty mission
    return { status: "no_mission", message: "No active mission today" };
  }
}

/**
 * Get all missions for a student
 */
export async function getMissionsList(studentId: number, status?: string) {
  try {
    const url = new URL(`${API_BASE}/api/missions/list/${studentId}`);
    if (status) {
      url.searchParams.append("status", status);
    }
    log(`Fetching missions list`, url.toString());

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    log(`Missions list fetched`, data);
    return data;
  } catch (error) {
    console.error("Error fetching missions:", error);
    // Graceful degradation - return empty list
    return { missions: [], count: 0 };
  }
}

/**
 * Mark a mission as completed
 */
export async function completeMission(studentId: number, missionId: number) {
  try {
    const url = `${API_BASE}/api/missions/${missionId}/complete?student_id=${studentId}`;
    log(`Completing mission`, { missionId, studentId });

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    log(`Mission completed successfully`, data);
    return data;
  } catch (error) {
    console.error("Error completing mission:", error);
    throw error;
  }
}

export default {
  // Re-export all functions
  API_BASE,
  registerStudent,
  login,
  fetchQuestion,
  getRandomQuestion,
  submitAnswer,
  getStudentProfile,
  getStudentProgress,
  getStudentStreak,
  getStudentMastery,
  getStudentAnalytics,
  healthCheck,
  getApiDocsUrl,
  // Onboarding
  getOnboardingStatus,
  saveOnboarding,
  // Missions
  getTodayMission,
  getMissionsList,
  completeMission,
};
