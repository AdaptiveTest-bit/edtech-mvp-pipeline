"use client";

import { useStudent } from "@/context/StudentContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { saveOnboarding } from "@/lib/api";

export default function OnboardingPage() {
  const router = useRouter();
  const { student } = useStudent();
  const [step, setStep] = useState(1);
  const [avatar, setAvatar] = useState("");
  const [goals, setGoals] = useState<Record<string, boolean>>({
    mathematics: false,
    science: false,
    language: false,
    history: false,
  });
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!student) {
      router.push("/login");
    }
  }, [student, router]);

  const avatars = ["🧑", "👨", "👩", "🧒", "👦", "👧"];

  const handleAvatarSelect = (selected: string) => {
    setAvatar(selected);
    setStep(2);
  };

  const handleGoalToggle = (goal: string) => {
    setGoals((prev) => ({
      ...prev,
      [goal]: !prev[goal],
    }));
  };

  const handleComplete = async () => {
    // Validate selections
    if (!avatar) {
      toast.error("Please select an avatar");
      return;
    }

    const selectedGoals = Object.values(goals).filter(Boolean);
    if (selectedGoals.length === 0) {
      toast.error("Please select at least one learning goal");
      return;
    }

    setLoading(true);
    try {
      const response = await saveOnboarding(
        student!.id,
        avatar,
        goals,
        100 // baseline_score
      );

      toast.success("🎉 Welcome to your learning journey!");

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      toast.error("Failed to save onboarding. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!student) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        {/* Header */}
        <h1 className="text-4xl font-bold text-center text-purple-600 mb-2">
          Welcome, {student.name}! 👋
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Let's personalize your learning experience
        </p>

        {/* Progress Bar */}
        <div className="mb-8 bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>

        {/* Step 1: Avatar Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Choose Your Avatar
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {avatars.map((ava) => (
                <button
                  key={ava}
                  onClick={() => handleAvatarSelect(ava)}
                  className={`p-8 rounded-xl text-4xl transition-all duration-200 ${
                    avatar === ava
                      ? "bg-purple-500 scale-110"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {ava}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Goal Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              What would you like to learn?
            </h2>
            <div className="space-y-3">
              {Object.keys(goals).map((goal) => (
                <label
                  key={goal}
                  className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200"
                  style={{
                    borderColor: goals[goal] ? "#9333ea" : "#e5e7eb",
                    backgroundColor: goals[goal] ? "#f3e8ff" : "#f9fafb",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={goals[goal]}
                    onChange={() => handleGoalToggle(goal)}
                    className="w-5 h-5 text-purple-600 rounded cursor-pointer"
                  />
                  <span className="ml-3 text-lg font-medium text-gray-800 capitalize">
                    {goal}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-6 py-3 bg-gray-300 text-gray-800 rounded-xl font-bold hover:bg-gray-400 transition-all duration-200"
                disabled={loading}
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Complete Setup"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
