"use client";
import { useState } from "react";

interface QuestionData {
  questionText: string;
  imageUrl?: string;
  options: string[];
  type: "MCQ";
}

interface QuestionCardProps {
  questionData: QuestionData;
  onAnswerSelected: (selectedIndex: number) => void;
  isSubmitting: boolean;
}

export default function QuestionCard({
  questionData,
  onAnswerSelected,
  isSubmitting,
}: QuestionCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleOptionClick = (index: number) => {
    if (!isSubmitting) {
      setSelectedIndex(index);
    }
  };

  const handleSubmit = () => {
    if (selectedIndex !== null && !isSubmitting) {
      onAnswerSelected(selectedIndex);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
      {/* Question Text */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {questionData.questionText}
      </h2>

      {/* Question Image (if provided) - supports diagrams, charts, pictures */}
      {questionData.imageUrl && (
        <div className="mb-8 flex justify-center">
          <img
            src={questionData.imageUrl}
            alt="Question illustration"
            className="max-w-full rounded-xl shadow-md max-h-80 object-contain"
            loading="lazy"
          />
        </div>
      )}

      {/* Options */}
      <div className="space-y-4 mb-8">
        {questionData.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          return (
            <button
              key={index}
              onClick={() => handleOptionClick(index)}
              disabled={isSubmitting}
              className={`
                w-full p-4 rounded-xl font-semibold text-left text-lg
                min-h-16 transition-all duration-200
                flex items-center justify-between
                ${
                  isSelected
                    ? "bg-blue-500 text-white border-4 border-blue-600 shadow-lg scale-105"
                    : "bg-gray-50 text-gray-800 border-3 border-gray-200 hover:bg-gray-100"
                }
                ${isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
              aria-pressed={isSelected}
              aria-disabled={isSubmitting}
              role="radio"
            >
              <span>{option}</span>
              {isSelected && (
                <span className="text-2xl">✓</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Submit Button */}
      {selectedIndex !== null && (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`
            w-full py-4 px-6 rounded-xl font-bold text-lg
            transition-all duration-200
            ${
              isSubmitting
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg active:scale-95"
            }
          `}
        >
          {isSubmitting ? "Checking..." : "Submit Answer"}
        </button>
      )}

      {/* Hint for selecting */}
      {selectedIndex === null && (
        <p className="text-center text-gray-400 text-sm">
          👆 Choose an option to continue
        </p>
      )}
    </div>
  );
}
