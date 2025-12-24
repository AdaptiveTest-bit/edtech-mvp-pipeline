"use client";
import { useState, useEffect } from "react";
import QuestionCard from "./QuestionCard";
import FeedbackOverlay from "./FeedbackOverlay";
import QuizProgress from "./QuizProgress";

interface Question {
  id: number;
  questionText: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  type: "MCQ";
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    questionText: "What is 12 × 12?",
    options: ["144", "124", "122", "142"],
    correctAnswer: 0,
    explanation: "12 × 12 = 144. You can break it down as (10 + 2) × 12 = 120 + 24 = 144",
    type: "MCQ",
  },
  {
    id: 2,
    questionText: "What is the capital of France?",
    options: ["Lyon", "Paris", "Marseille", "Nice"],
    correctAnswer: 1,
    explanation: "Paris is the capital and largest city of France, located in the north-central part of the country.",
    type: "MCQ",
  },
  {
    id: 3,
    questionText: "What is the chemical symbol for Gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correctAnswer: 2,
    explanation: "Au is the chemical symbol for Gold, derived from its Latin name 'Aurum'.",
    type: "MCQ",
  },
  {
    id: 4,
    questionText: "Which shape is shown in the image below?",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Square_shape.svg/440px-Square_shape.svg.png",
    options: ["Circle", "Triangle", "Square", "Pentagon"],
    correctAnswer: 2,
    explanation: "A square is a regular quadrilateral with 4 equal sides and 4 right angles.",
    type: "MCQ",
  },
];

export default function Arena() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Load progress from localStorage on mount
  useEffect(() => {
    const savedState = typeof window !== "undefined" ? window.localStorage.getItem("quizState") : null;
    if (savedState) {
      try {
        const { questionIndex, selectedAnswer, currentScore } = JSON.parse(savedState);
        setCurrentQuestionIndex(questionIndex);
        setSelectedAnswerIndex(selectedAnswer);
        setScore(currentScore);
      } catch {
        // Ignore parse errors, use defaults
      }
    }
    setMounted(true);
  }, []);

  // Save progress to localStorage whenever state changes
  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      window.localStorage.setItem(
        "quizState",
        JSON.stringify({
          questionIndex: currentQuestionIndex,
          selectedAnswer: selectedAnswerIndex,
          currentScore: score,
        })
      );
    }
  }, [currentQuestionIndex, selectedAnswerIndex, score, mounted]);

  const currentQuestion = SAMPLE_QUESTIONS[currentQuestionIndex];
  const isCorrect = selectedAnswerIndex === currentQuestion.correctAnswer;

  const handleAnswerSelected = (answerIndex: number) => {
    setIsSubmitting(true);
    setSelectedAnswerIndex(answerIndex);

    // Simulate API call delay
    setTimeout(() => {
      setShowFeedback(true);
      if (answerIndex === currentQuestion.correctAnswer) {
        setScore(score + 10);
      }
      setIsSubmitting(false);
    }, 500);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < SAMPLE_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowFeedback(false);
      setSelectedAnswerIndex(null);
    } else {
      // Quiz completed
      const finalScore = score + (isCorrect ? 10 : 0);
      alert(`🎓 Quiz Complete! Your Score: ${finalScore} XP`);
      // Reset quiz
      setCurrentQuestionIndex(0);
      setScore(0);
      setShowFeedback(false);
      setSelectedAnswerIndex(null);
      window.localStorage.removeItem("quizState");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Quiz Arena</h1>
          <p className="text-lg text-gray-600">Test your knowledge! 🚀</p>
          <p className="text-sm text-gray-500 mt-2">Score: {score} XP</p>
        </div>

        {/* Progress Bar */}
        {mounted && (
          <>
            <QuizProgress
              currentQuestion={currentQuestionIndex + 1}
              totalQuestions={SAMPLE_QUESTIONS.length}
            />

            {/* Question Card */}
            <div className="mb-8">
              <QuestionCard
                questionData={currentQuestion}
                onAnswerSelected={handleAnswerSelected}
                isSubmitting={isSubmitting}
              />
            </div>

            {/* Feedback Overlay */}
            {showFeedback && (
              <FeedbackOverlay
                isCorrect={isCorrect}
                explanation={currentQuestion.explanation}
                onNext={handleNextQuestion}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
