"use client";
import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import toast from "react-hot-toast";

interface StreakCounterProps {
  streakDays: number;
  lastActivityDate?: string;
  personalBest?: number;
}

export default function StreakCounter({
  streakDays = 5,
  lastActivityDate,
  personalBest = 15,
}: StreakCounterProps) {
  const [mounted, setMounted] = useState(false);
  const [animatedStreak, setAnimatedStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [previousStreak, setPreviousStreak] = useState(streakDays);
  const windowRef = useRef<Window | null>(null);

  useEffect(() => {
    setMounted(true);
    windowRef.current = window;
  }, []);

  // Animate counter from 0 to streakDays
  useEffect(() => {
    if (!mounted) return;

    let current = 0;
    const increment = Math.ceil(streakDays / 20);
    const interval = setInterval(() => {
      current += increment;
      if (current >= streakDays) {
        setAnimatedStreak(streakDays);
        clearInterval(interval);
      } else {
        setAnimatedStreak(current);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [streakDays, mounted]);

  // Trigger confetti when streak increases
  useEffect(() => {
    if (streakDays > previousStreak) {
      setShowConfetti(true);
      toast.success(`🔥 Streak increased to ${streakDays}!`);

      // Auto-hide confetti after 3 seconds
      setTimeout(() => setShowConfetti(false), 3000);
    }
    setPreviousStreak(streakDays);
  }, [streakDays, previousStreak]);

  if (!mounted) return null;

  return (
    <div className="relative">
      {showConfetti && (
        <Confetti
          width={windowRef.current?.innerWidth || 0}
          height={windowRef.current?.innerHeight || 0}
          numberOfPieces={100}
          recycle={false}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Streak Card */}
        <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 text-white shadow-lg transform transition-transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold opacity-90">Current Streak</h3>
            <span className="text-3xl">🔥</span>
          </div>
          <p className="text-5xl font-bold mb-2">{animatedStreak}</p>
          <p className="text-sm opacity-75">Days in a row</p>
          {lastActivityDate && (
            <p className="text-xs opacity-60 mt-2">Last activity: {lastActivityDate}</p>
          )}
        </div>

        {/* Personal Best Card */}
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl p-6 text-white shadow-lg transform transition-transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold opacity-90">Personal Best</h3>
            <span className="text-3xl">⭐</span>
          </div>
          <p className="text-5xl font-bold mb-2">{personalBest}</p>
          <p className="text-sm opacity-75">Days longest streak</p>
          {personalBest === streakDays && (
            <p className="text-xs opacity-60 mt-2">🎯 You're crushing it!</p>
          )}
        </div>

        {/* Motivational Card */}
        <div className="bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-center">
          <h3 className="text-sm font-semibold opacity-90 mb-3">Next Milestone</h3>
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>{streakDays} days</span>
              <span>{personalBest} days</span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${(streakDays / personalBest) * 100}%` }}
              />
            </div>
          </div>
          <p className="text-sm font-semibold">
            {personalBest - streakDays} more days to beat your record!
          </p>
        </div>
      </div>
    </div>
  );
}
