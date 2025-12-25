"use client";
import { useStudent } from "@/context/StudentContext";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getTodayMission, completeMission, Mission } from "@/lib/api";

interface MissionControlProps {
  onStartMission?: () => void;
}

export default function MissionControl({ onStartMission }: MissionControlProps) {
  const { student } = useStudent();
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch mission when student is available
  useEffect(() => {
    if (!student || !mounted) return;

    const fetchMission = async () => {
      try {
        const data = await getTodayMission(student.id);

        // If data has an id, it's a real mission
        if (data.id) {
          setMission(data);
        } else {
          // No mission today
          setMission(null);
        }
      } catch (error) {
        console.error("Error fetching mission:", error);
        setMission(null); // Graceful degradation
      } finally {
        setLoading(false);
      }
    };

    fetchMission();
  }, [student, mounted]);

  const handleCompleteMission = async () => {
    if (!mission || !student) return;

    setCompleting(true);
    try {
      const response = await completeMission(student.id, mission.id);
      toast.success(`🎉 ${response.message}`);
      setMission(null); // Clear mission after completion
    } catch (error) {
      toast.error("Failed to complete mission");
      console.error(error);
    } finally {
      setCompleting(false);
    }
  };

  if (!mounted) return null;

  // Loading state
  if (loading) {
    return (
      <div className="w-full mb-8">
        <div className="rounded-2xl shadow-xl bg-gradient-to-br from-gray-300 to-gray-400 p-8 text-white">
          <p className="text-center">Loading today's mission...</p>
        </div>
      </div>
    );
  }

  // No mission state
  if (!mission) {
    return (
      <div className="w-full mb-8">
        <div className="rounded-2xl shadow-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No Mission Today 🌟
            </h2>
            <p className="text-gray-600 mb-4">
              Check back tomorrow for a new daily mission!
            </p>
            <p className="text-sm text-gray-500">
              💡 Missions reset daily at midnight
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Mission available state
  return (
    <div className="w-full mb-8">
      <div className="rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-white relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full blur-3xl -ml-16 -mb-16" />

        {/* Content */}
        <div className="relative z-10">
          <h2 className="text-4xl font-bold mb-2">{mission.title}</h2>
          <p className="text-lg opacity-95 mb-6">{mission.description}</p>

          {/* Reward Badge */}
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full backdrop-blur-md inline-block">
              <p className="text-sm font-semibold">
                Reward: <span className="text-yellow-300 font-bold">+{mission.reward_xp} XP</span>
              </p>
            </div>
            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full backdrop-blur-md inline-block">
              <p className="text-sm font-semibold">
                Due: {new Date(mission.due_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Complete Button */}
          <button
            onClick={handleCompleteMission}
            disabled={completing}
            className={`
              relative inline-block px-8 py-4 font-bold text-lg rounded-xl
              bg-white text-purple-600 transition-all duration-300
              hover:scale-105 hover:shadow-2xl
              active:scale-95
              disabled:opacity-50
              disabled:cursor-not-allowed
            `}
          >
            {completing ? "⏳ Completing..." : "✅ Complete Mission"}
          </button>

          {/* Motivational text */}
          <p className="text-sm opacity-75 mt-4">
            💡 Complete your daily mission to build a streak!
          </p>
        </div>
      </div>
    </div>
  );
}
