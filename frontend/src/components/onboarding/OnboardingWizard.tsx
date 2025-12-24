"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface WizardStep {
  step: number;
  title: string;
  description: string;
}

const AVATARS = [
  { id: "robot", name: "Robot", emoji: "🤖" },
  { id: "wizard", name: "Wizard", emoji: "🧙" },
  { id: "cat", name: "Cat", emoji: "😸" },
  { id: "astronaut", name: "Astronaut", emoji: "👨‍🚀" },
  { id: "ninja", name: "Ninja", emoji: "🥷" },
  { id: "superhero", name: "Superhero", emoji: "🦸" },
];

const GOALS = [
  { id: "exams", label: "School Exams", emoji: "📚" },
  { id: "olympiads", label: "Olympiads", emoji: "🏆" },
  { id: "fun", label: "Just for Fun", emoji: "🎮" },
];

const BASELINE_QUESTIONS = [
  { id: 1, question: "What is 12 × 4?", options: ["24", "48", "36", "60"], correct: 1 },
  { id: 2, question: "What is 50 ÷ 5?", options: ["5", "10", "15", "20"], correct: 1 },
  { id: 3, question: "15 + 27 = ?", options: ["32", "42", "52", "62"], correct: 2 },
];

export default function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBuildingProfile, setIsBuildingProfile] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    avatar: AVATARS[0].id,
    goal: GOALS[0].id,
    baselineAnswers: [null, null, null] as (number | null)[],
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value });
  };

  const handleAvatarSelect = (avatarId: string) => {
    setFormData({ ...formData, avatar: avatarId });
  };

  const handleGoalSelect = (goalId: string) => {
    setFormData({ ...formData, goal: goalId });
  };

  const handleBaselineAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...formData.baselineAnswers];
    newAnswers[questionIndex] = answerIndex;
    setFormData({ ...formData, baselineAnswers: newAnswers });
  };

  const handleNextStep = async () => {
    if (currentStep === 3) {
      setIsAnalyzing(true);
      // Simulate analysis
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsAnalyzing(false);
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setIsBuildingProfile(true);
      // Simulate profile building
      await new Promise((resolve) => setTimeout(resolve, 3000));
      // Redirect to student dashboard
      router.push("/student/dashboard");
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    if (currentStep === 1) return formData.name.trim().length > 0;
    if (currentStep === 2) return formData.goal !== "";
    if (currentStep === 3) return formData.baselineAnswers.every((ans) => ans !== null);
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-white font-semibold text-sm">Step {Math.min(currentStep, 3)} of 3</span>
            <span className="text-white text-sm">{Math.round((Math.min(currentStep, 3) / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
            <div
              className="h-2 bg-white rounded-full transition-all duration-500"
              style={{ width: `${(Math.min(currentStep, 3) / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Step 1: Identity */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  What's your name?
                </h2>
                <p className="text-gray-600">Let's personalize your learning journey</p>
              </div>

              <input
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleNameChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg"
                autoFocus
              />

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Pick your Avatar 🎨
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {AVATARS.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => handleAvatarSelect(avatar.id)}
                      className={`
                        p-4 rounded-lg border-2 transition-all
                        ${
                          formData.avatar === avatar.id
                            ? "border-blue-500 bg-blue-50 shadow-lg scale-105"
                            : "border-gray-300 hover:border-gray-400"
                        }
                      `}
                    >
                      <div className="text-4xl mb-2">{avatar.emoji}</div>
                      <p className="text-sm font-semibold text-gray-800">{avatar.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Goal */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  What's your goal?
                </h2>
                <p className="text-gray-600">We'll customize your learning experience</p>
              </div>

              <div className="space-y-3">
                {GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => handleGoalSelect(goal.id)}
                    className={`
                      w-full p-4 rounded-lg border-2 text-left transition-all
                      ${
                        formData.goal === goal.id
                          ? "border-blue-500 bg-blue-50 shadow-lg"
                          : "border-gray-300 hover:border-gray-400"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{goal.emoji}</span>
                      <div>
                        <p className="font-semibold text-gray-800">{goal.label}</p>
                        <p className="text-xs text-gray-500">
                          {goal.id === "exams" && "Focus on your upcoming exams"}
                          {goal.id === "olympiads" && "Push your limits with advanced problems"}
                          {goal.id === "fun" && "Learn at your own pace, have fun"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Baseline */}
          {currentStep === 3 && !isAnalyzing && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Let's see what you know 🧠
                </h2>
                <p className="text-gray-600">Quick baseline to personalize difficulty</p>
              </div>

              <div className="space-y-6">
                {BASELINE_QUESTIONS.map((q, qIdx) => (
                  <div key={q.id} className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-800 mb-3">{q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((option, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleBaselineAnswer(qIdx, oIdx)}
                          className={`
                            w-full p-3 rounded-lg border-2 text-left transition-all
                            ${
                              formData.baselineAnswers[qIdx] === oIdx
                                ? "border-blue-500 bg-blue-100"
                                : "border-gray-300 hover:border-gray-400"
                            }
                          `}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Analyzing */}
          {currentStep === 3 && isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-12 animate-fadeIn">
              <div className="text-6xl mb-4 animate-bounce">📊</div>
              <p className="text-2xl font-bold text-gray-800 mb-2">Analyzing...</p>
              <p className="text-gray-600">We're calculating your current level</p>
              <div className="mt-6 w-full bg-gray-200 rounded-full h-1">
                <div className="h-1 bg-blue-500 rounded-full animate-pulse" style={{ width: "100%" }} />
              </div>
            </div>
          )}

          {/* Step 4: Building Profile */}
          {currentStep === 4 && (
            <div className="flex flex-col items-center justify-center py-12 animate-fadeIn">
              <div className="text-6xl mb-4 animate-spin">⚙️</div>
              {!isBuildingProfile ? (
                <>
                  <p className="text-2xl font-bold text-gray-800 mb-2">
                    Awesome, {formData.name}! 🎉
                  </p>
                  <p className="text-gray-600 text-center mb-6">
                    Your learning profile is being prepared with personalized content
                  </p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-800 mb-2">
                    Building your personal syllabus...
                  </p>
                  <p className="text-gray-600 mb-4">This might take a moment</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"
                      style={{ width: "100%" }}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handlePreviousStep}
              disabled={currentStep === 1 || isAnalyzing || isBuildingProfile}
              className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={handleNextStep}
              disabled={!isStepValid() || isAnalyzing || isBuildingProfile}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 transition-all active:scale-95"
            >
              {currentStep === 3 && !isAnalyzing ? "Analyze" : currentStep === 4 ? "Enter Dashboard" : "Next →"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-white text-center mt-6 text-sm opacity-75">
          This setup takes less than 2 minutes ⚡
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
