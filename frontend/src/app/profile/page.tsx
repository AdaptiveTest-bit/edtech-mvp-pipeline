"use client";
import { useRouter } from "next/navigation";
import { useStudent } from "@/context/StudentContext";
import { useState, useEffect } from "react";
import { getStudentProgress } from "@/lib/api";

interface StudentStats {
  name: string;
  email: string;
  total_xp: number;
  current_streak: number;
  best_streak: number;
  chapters: Array<any>;
}

export default function ProfilePage() {
  const router = useRouter();
  const { student, logout } = useStudent();
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    if (!student) {
      router.push("/login");
      return;
    }

    const fetchStats = async () => {
      try {
        const progress = await getStudentProgress(student.id);
        setStats(progress);
      } catch (err) {
        console.error(err);
        // Continue without stats if fetch fails
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [student, router]);

  const handleLogout = async () => {
    setLogoutLoading(true);
    logout();
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push("/");
  };

  if (!student) return null;

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account and view your statistics</p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        {/* Profile Header with Gradient */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-400"></div>

        {/* Profile Content */}
        <div className="px-6 sm:px-8 pb-8">
          {/* Avatar and Name */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 mb-8 relative z-10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {student.name}
              </h2>
              <p className="text-gray-600">{student.email}</p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Name
                </label>
                <p className="text-lg text-gray-900">{student.name}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Email
                </label>
                <p className="text-lg text-gray-900">{student.email}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Student ID
                </label>
                <p className="text-lg text-gray-900 font-mono">#{student.id}</p>
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          {stats && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Learning Statistics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Total XP</div>
                  <div className="text-2xl font-bold text-blue-900 mt-1">
                    {stats.total_xp}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">Points earned</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <div className="text-sm text-orange-600 font-medium">Current Streak</div>
                  <div className="text-2xl font-bold text-orange-900 mt-1">
                    {stats.current_streak} 🔥
                  </div>
                  <div className="text-xs text-orange-600 mt-1">Days in a row</div>
                </div>
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Best Streak</div>
                  <div className="text-2xl font-bold text-green-900 mt-1">
                    {stats.best_streak}
                  </div>
                  <div className="text-xs text-green-600 mt-1">Personal best</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium">Chapters</div>
                  <div className="text-2xl font-bold text-purple-900 mt-1">
                    {stats.chapters.length}
                  </div>
                  <div className="text-xs text-purple-600 mt-1">In progress</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-lg shadow p-6 sm:p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Account Actions</h3>
        <div className="space-y-3">
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {logoutLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Logging out...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Tips for Success</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>✅ Practice daily to maintain your streak</li>
          <li>✅ Focus on concepts marked for review</li>
          <li>✅ Aim to reach higher Leitner box levels</li>
          <li>✅ Check the Progress page to track your mastery</li>
        </ul>
      </div>
    </div>
  );
}
