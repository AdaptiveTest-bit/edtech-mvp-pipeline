"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import QuestionCard from "./QuestionCard";
import FeedbackOverlay from "./FeedbackOverlay";
import QuizProgress from "./QuizProgress";
import {
  getRandomQuestion,
  submitAnswer,
  type Question,
  type SubmitAnswerResponse,
} from "@/lib/api";
import { useStudent } from "@/context/StudentContext";

// Type for our local question format (adapts API response to component format)
interface LocalQuestion {
  id: number;
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
  correctAnswer: keyof typeof optionsMap; // "A", "B", "C", or "D"
  explanation: string;
  conceptId: number;
}

// Map option keys to array indices for QuestionCard
const optionsMap = { A: 0, B: 1, C: 2, D: 3 } as const;
const optionsReverseMap = { 0: "A", 1: "B", 2: "C", 3: "D" } as const;

export default function Arena() {
  const router = useRouter();
  const { student, isLoading: isStudentLoading } = useStudent();

  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState<LocalQuestion | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [totalXpEarned, setTotalXpEarned] = useState(0);
  const [currentConceptId] = useState(1); // Will come from navigation/props
  const [difficulty, setDifficulty] = useState<1 | 2>(1); // 1=Easy, 2=Hard

  // UI state
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [xpEarned, setXpEarned] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ========================================================================
  // STEP 1: Check authentication on mount
  // ========================================================================

  useEffect(() => {
    if (!isStudentLoading && !student) {
      // Not logged in → redirect to login
      console.log("⚠️  Student not logged in. Redirecting to /login");
      router.push("/login");
    }
  }, [student, isStudentLoading, router]);

  // ========================================================================
  // STEP 2: Fetch first question when component mounts and student is logged in
  // ========================================================================

  useEffect(() => {
    if (student) {
      loadNextQuestion();
    }
  }, [student]);

  // ========================================================================
  // STEP 3: Load next question from API
  // ========================================================================

  const loadNextQuestion = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setShowFeedback(false);
      setSelectedAnswerIndex(null);

      console.log(`📝 Fetching question for concept ${currentConceptId}, difficulty ${difficulty}...`);

      // Call backend to get random question for this concept with selected difficulty
      const apiQuestion = await getRandomQuestion(currentConceptId, difficulty);

      // Convert API format to local format
      const localQuestion: LocalQuestion = {
        id: apiQuestion.id,
        content: apiQuestion.content,
        correctAnswer: apiQuestion.correct_option_key as "A" | "B" | "C" | "D",
        explanation: apiQuestion.explanation,
        conceptId: apiQuestion.concept_id,
      };

      setCurrentQuestion(localQuestion);
      console.log("✅ Question loaded:", localQuestion.id);
    } catch (err) {
      console.error("❌ Failed to load question:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load question";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================================================
  // STEP 4: Handle answer selection and submit to API
  // ========================================================================

  const handleAnswerSelected = async (answerIndex: number) => {
    if (!student || !currentQuestion) return;

    try {
      setIsSubmitting(true);
      setSelectedAnswerIndex(answerIndex);

      // Convert array index (0-3) to option key (A-D)
      const selectedOption = optionsReverseMap[answerIndex as 0 | 1 | 2 | 3];

      console.log(`📤 Submitting answer: ${selectedOption} for question ${currentQuestion.id}`);

      // Call backend to submit answer
      const response: SubmitAnswerResponse = await submitAnswer(
        currentQuestion.id,
        student.id,
        selectedOption,
        30 // Assume ~30 seconds per question (you could track actual time)
      );

      console.log("✅ Answer submitted. Response:", response);

      // Update UI with feedback
      setIsCorrect(response.is_correct);
      setXpEarned(response.xp_earned);
      setFeedback(response.explanation);
      setShowFeedback(true);

      // Show toast notification
      if (response.is_correct) {
        toast.success(`✨ Correct! +${response.xp_earned} XP`);
      } else {
        toast.error("❌ Incorrect. Try again!");
      }

      // Update totals
      setQuestionsAnswered(questionsAnswered + 1);
      setTotalXpEarned(totalXpEarned + response.xp_earned);

      // Log mastery update
      if (response.concept_mastery_score) {
        console.log(`📊 Concept mastery updated: ${response.concept_mastery_score.toFixed(1)}%`);
      }
    } catch (err) {
      console.error("❌ Failed to submit answer:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to submit answer";
      setError(errorMessage);
      setShowFeedback(true);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================================================
  // STEP 5: Handle next question or quiz completion
  // ========================================================================

  const handleNextQuestion = async () => {
    // Continue to next question
    await loadNextQuestion();
  };

  // ========================================================================
  // RENDERING
  // ========================================================================

  // Loading state (checking authentication)
  if (isStudentLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in (shouldn't reach here due to useEffect redirect, but just in case)
  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // No question loaded
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600">
            {error ? `Error: ${error}` : "Loading question..."}
          </p>
        </div>
      </div>
    );
  }

  // Convert local question to format expected by QuestionCard
  const questionCardData = {
    id: currentQuestion.id,
    questionText: currentQuestion.content.text,
    hint: currentQuestion.content.hint,
    imageUrl: undefined, // API doesn't have image URLs
    options: [
      currentQuestion.content.options.A,
      currentQuestion.content.options.B,
      currentQuestion.content.options.C,
      currentQuestion.content.options.D,
    ],
    correctAnswer: optionsMap[currentQuestion.correctAnswer],
    explanation: currentQuestion.explanation,
    type: "MCQ" as const,
  };

  // Main quiz UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Quiz Arena</h1>
          <p className="text-lg text-gray-600">Test your knowledge! 🚀</p>
          
          {/* Difficulty Selector */}
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => setDifficulty(1)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                difficulty === 1
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
              disabled={isLoading || isSubmitting}
            >
              📚 Easy
            </button>
            <button
              onClick={() => setDifficulty(2)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                difficulty === 2
                  ? "bg-red-600 text-white shadow-lg scale-105"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
              disabled={isLoading || isSubmitting}
            >
              🔥 Hard
            </button>
          </div>
          
          <div className="mt-4 flex justify-center gap-8 text-sm">
            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <p className="text-gray-600">Student</p>
              <p className="text-lg font-semibold text-gray-800">{student.name}</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <p className="text-gray-600">Questions Answered</p>
              <p className="text-lg font-semibold text-indigo-600">{questionsAnswered}</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <p className="text-gray-600">XP Earned</p>
              <p className="text-lg font-semibold text-green-600">+{totalXpEarned}</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <QuizProgress currentQuestion={questionsAnswered + 1} totalQuestions={99} />

        {/* Difficulty Indicator */}
        <div className="text-center mb-4">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
            difficulty === 1
              ? "bg-blue-100 text-blue-800"
              : "bg-red-100 text-red-800"
          }`}>
            {difficulty === 1 ? "📚 Easy Mode" : "🔥 Hard Mode"}
          </span>
        </div>

        {/* Question Card */}
        <div className="mb-8">
          <QuestionCard
            questionData={questionCardData}
            onAnswerSelected={handleAnswerSelected}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Feedback Overlay */}
        {showFeedback && (
          <FeedbackOverlay
            isCorrect={isCorrect}
            explanation={feedback}
            xpEarned={xpEarned}
            onNext={handleNextQuestion}
          />
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Loading Indicator during submission */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Submitting answer...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
