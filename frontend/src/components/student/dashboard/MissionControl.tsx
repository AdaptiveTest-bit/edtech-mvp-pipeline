"use client";
import { useState, useEffect } from "react";

interface MissionControlProps {
  missionTitle?: string;
  missionDescription?: string;
  rewardXP?: number;
  isCompleted?: boolean;
  onStartMission: () => void;
}

export default function MissionControl({
  missionTitle = "Today's Mission",
  missionDescription = "Review Fractions and Angles",
  rewardXP = 50,
  isCompleted = false,
  onStartMission,
}: MissionControlProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full mb-8">
      <div
        className={`
          rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300
          ${
            isCompleted
              ? "bg-gradient-to-br from-green-400 to-green-600"
              : "bg-gradient-to-br from-blue-500 to-purple-600"
          }
          p-8 text-white relative overflow-hidden
        `}
      >
        {/* Animated background orbs */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full blur-3xl -ml-16 -mb-16" />

        {/* Content */}
        <div className="relative z-10">
          {isCompleted ? (
            <>
              <h2 className="text-4xl font-bold mb-2">✓ Mission Accomplished!</h2>
              <p className="text-lg opacity-95 mb-4">Come back tomorrow for a new mission</p>
              <div className="inline-block bg-white bg-opacity-20 px-4 py-2 rounded-full backdrop-blur-md">
                <p className="text-sm font-semibold">Next mission in 23 hours 45 minutes</p>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-bold mb-2">{missionTitle}</h2>
              <p className="text-lg opacity-95 mb-6">{missionDescription}</p>

              {/* Reward Badge */}
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full backdrop-blur-md inline-block">
                  <p className="text-sm font-semibold">
                    Potential Reward: <span className="text-yellow-300 font-bold">+{rewardXP} XP</span>
                  </p>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={onStartMission}
                className={`
                  relative inline-block px-8 py-4 font-bold text-lg rounded-xl
                  bg-white text-purple-600 transition-all duration-300
                  hover:scale-105 hover:shadow-2xl
                  active:scale-95
                  before:content-['']
                  before:absolute
                  before:inset-0
                  before:rounded-xl
                  before:bg-gradient-to-r
                  before:from-yellow-400
                  before:to-yellow-500
                  before:opacity-0
                  before:animate-pulse
                  before:-z-10
                `}
              >
                🚀 Start Mission
              </button>

              {/* Motivational text */}
              <p className="text-sm opacity-75 mt-4">
                💡 Complete your daily mission to build a streak!
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
