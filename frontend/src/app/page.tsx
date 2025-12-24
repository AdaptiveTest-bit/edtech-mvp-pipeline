'use client';

import { useRouter } from 'next/navigation';
import { useStudent } from '@/context/StudentContext';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();
  const { student, isLoading, logout } = useStudent();

  const handleStartQuiz = () => {
    router.push('/quiz/arena');
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-indigo-600">EduMastery</h1>
          {student && (
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Welcome, <span className="font-semibold">{student.name}</span></span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left: Welcome Message */}
          <div className="space-y-6">
            <div>
              <h2 className="text-5xl font-bold text-gray-900 mb-4">
                Master Your Skills
              </h2>
              <p className="text-xl text-gray-600">
                Interactive quizzes with adaptive learning. Get smarter every day with spaced repetition and mastery tracking.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <p className="text-gray-700"><strong>Adaptive Learning:</strong> Questions adjust to your level</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <p className="text-gray-700"><strong>Mastery Tracking:</strong> See your progress in real time</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <p className="text-gray-700"><strong>Spaced Repetition:</strong> Learn at the optimal pace</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              {student ? (
                <button
                  onClick={handleStartQuiz}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-lg"
                >
                  Start Quiz →
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSignIn}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-lg"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={handleRegister}
                    className="px-8 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-semibold text-lg"
                  >
                    Create Account
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right: Demo Info & Stats */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">5</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500 text-sm font-medium">Questions</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">33+</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500 text-sm font-medium">Concepts</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">10</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500 text-sm font-medium">Updates</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">Live</p>
              </div>
            </div>

            {/* Demo Credentials */}
            {!student && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
                <h3 className="font-semibold text-gray-900 mb-3">Try Demo Credentials</h3>
                <div className="space-y-2 text-sm font-mono bg-white p-3 rounded border border-blue-200">
                  <p className="text-gray-700"><strong>Email:</strong> alice@example.com</p>
                  <p className="text-gray-700"><strong>Password:</strong> any password</p>
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  The demo account has pre-loaded quiz history and mastery data.
                </p>
              </div>
            )}

            {/* Student Stats (if logged in) */}
            {student && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Your Info</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-500 text-sm">Name</p>
                    <p className="text-lg font-semibold text-gray-900">{student.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Email</p>
                    <p className="text-lg font-semibold text-gray-900">{student.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Student ID</p>
                    <p className="text-sm font-mono text-gray-700">{student.id}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600">
            EduMastery MVP • Adaptive Learning Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
