"use client";

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
}

export default function QuizProgress({
  currentQuestion,
  totalQuestions,
}: QuizProgressProps) {
  const progressPercentage = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="w-full bg-white rounded-xl shadow-md p-4 mb-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">
          Question {currentQuestion} of {totalQuestions}
        </h3>
        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
          {Math.round(progressPercentage)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Question Dots (Optional: Show mini dots for each question) */}
      <div className="flex gap-1 mt-4">
        {Array.from({ length: totalQuestions }).map((_, index) => (
          <div
            key={index}
            className={`
              h-2 rounded-full transition-all duration-200
              ${
                index < currentQuestion
                  ? "bg-green-500 w-3"
                  : index === currentQuestion - 1
                  ? "bg-blue-500 w-4"
                  : "bg-gray-300 w-2"
              }
            `}
          />
        ))}
      </div>
    </div>
  );
}
