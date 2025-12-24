"use client";
import { useEffect, useState } from "react";

interface FeedbackOverlayProps {
  isCorrect: boolean;
  explanation: string;
  onNext: () => void;
}

export default function FeedbackOverlay({
  isCorrect,
  explanation,
  onNext,
}: FeedbackOverlayProps) {
  const [showConfetti, setShowConfetti] = useState(isCorrect);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setAnimate(true);

    // Auto-dismiss confetti after 2 seconds
    if (isCorrect) {
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCorrect]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`
          bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full
          transition-all duration-300 transform
          ${animate ? "scale-100 opacity-100" : "scale-90 opacity-0"}
        `}
      >
        {isCorrect ? (
          <>
            {/* Correct Answer Section */}
            <div className="text-center mb-6">
              {/* Animated Checkmark */}
              <div className="inline-block">
                <div
                  className={`
                    w-24 h-24 bg-green-100 rounded-full flex items-center justify-center
                    transition-all duration-500 transform
                    ${animate ? "scale-100" : "scale-0"}
                  `}
                >
                  <span className="text-6xl animate-bounce">✓</span>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-green-600 mt-6 mb-2">
                Superstar!
              </h2>
              <p className="text-xl font-semibold text-green-500">+10 XP</p>
            </div>

            {/* Confetti Placeholder */}
            {showConfetti && (
              <div className="flex justify-around mb-6 text-2xl animate-pulse">
                <span>🎉</span>
                <span>🎊</span>
                <span>⭐</span>
                <span>🎉</span>
                <span>🎊</span>
              </div>
            )}

            {/* Explanation (Optional for correct) */}
            {explanation && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-6">
                <p className="text-sm text-blue-800">{explanation}</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Incorrect Answer Section */}
            <div className="text-center mb-6">
              <div className="inline-block">
                <div
                  className={`
                    w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center
                    transition-all duration-500 transform
                    ${animate ? "scale-100" : "scale-0"}
                  `}
                >
                  <span className="text-5xl">💭</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-orange-600 mt-6 mb-2">
                Nice Try!
              </h2>
              <p className="text-gray-600">Let's learn from this</p>
            </div>

            {/* Explanation Box */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">
                Here's the explanation:
              </h3>
              <p className="text-sm text-gray-700">{explanation}</p>
            </div>
          </>
        )}

        {/* Next Question Button */}
        <button
          onClick={onNext}
          className={`
            w-full py-4 px-6 rounded-xl font-bold text-lg
            flex items-center justify-center gap-3
            transition-all duration-200
            ${
              isCorrect
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-orange-500 text-white hover:bg-orange-600"
            }
            hover:shadow-lg active:scale-95
          `}
        >
          Next Question
          <span className="text-xl">→</span>
        </button>
      </div>
    </div>
  );
}
