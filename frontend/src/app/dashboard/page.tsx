"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStudent } from "@/context/StudentContext";
import { getStudentProgress } from "@/lib/api";

interface Chapter {
  chapter_id: number;
  name: string;
  status: string;
  mastery_score: number;
  questions_completed: number;
  questions_correct: number;
}

interface StudentProgress {
  name: string;
  total_xp: number;
  current_streak: number;
  best_streak: number;
  chapters: Chapter[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { student } = useStudent();
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!student) {
      router.push("/login");
      return;
    }

    const fetchProgress = async () => {
      try {
        const data = await getStudentProgress(student.id);
        setProgress(data);
      } catch (err) {
        setError("Failed to load progress");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [student, router]);

  if (!student) return null;

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading your progress...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-600 font-semibold">{error}</div>;
  }

  if (!progress) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "mastered":
        return "bg-green-100 text-green-800";
      case "unlocked":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {progress.name}! 👋</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <div className="text-gray-600 text-sm font-medium">Total XP</div>
          <div className="text-3xl sm:text-4xl font-bold text-blue-600 mt-2">
            {progress.total_xp}
          </div>
          <div className="text-xs text-gray-500 mt-1">Points earned</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <div className="text-gray-600 text-sm font-medium">Current Streak</div>
          <div className="text-3xl sm:text-4xl font-bold text-orange-600 mt-2 flex items-center">
            {progress.current_streak} <span className="text-2xl ml-2">🔥</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Days in a row</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <div className="text-gray-600 text-sm font-medium">Best Streak</div>
          <div className="text-3xl sm:text-4xl font-bold text-green-600 mt-2">
            {progress.best_streak}
          </div>
          <div className="text-xs text-gray-500 mt-1">Personal best</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <div className="text-gray-600 text-sm font-medium">Chapters</div>
          <div className="text-3xl sm:text-4xl font-bold text-purple-600 mt-2">
            {progress.chapters.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">In progress</div>
        </div>
      </div>

      {/* Chapters Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Your Chapters</h2>
          <p className="text-sm text-gray-600 mt-1">Track your progress across all chapters</p>
        </div>

        <div className="divide-y divide-gray-200">
          {progress.chapters.length > 0 ? (
            progress.chapters.map((chapter) => (
              <div
                key={chapter.chapter_id}
                className="p-4 sm:p-6 hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {chapter.name}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(
                      chapter.status
                    )}`}
                  >
                    {chapter.status.charAt(0).toUpperCase() + chapter.status.slice(1)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${chapter.mastery_score}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 flex-wrap gap-2">
                  <span>
                    {chapter.questions_correct}/{chapter.questions_completed} correct
                  </span>
                  <span className="font-semibold text-gray-900">
                    {chapter.mastery_score.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-600">
              No chapters available yet
            </div>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-8 text-center">
        <button
          onClick={() => router.push("/quiz/arena")}
          className="px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105 inline-block"
        >
          Start Quiz →
        </button>
      </div>
    </div>
  );
}
