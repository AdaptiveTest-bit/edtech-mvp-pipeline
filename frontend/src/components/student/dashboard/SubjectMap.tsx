"use client";
import Link from "next/link";
import { useState } from "react";

interface Chapter {
  id: string;
  title: string;
  masteryScore: number; // 0-100
  status: "locked" | "unlocked";
  topicsCount?: number;
  questionsCompleted?: number;
}

interface SubjectMapProps {
  chapters: Chapter[];
  subject?: string;
}

const getMasteryColor = (score: number) => {
  if (score > 80) return "from-green-400 to-emerald-500";
  if (score >= 40) return "from-yellow-400 to-amber-500";
  return "from-red-400 to-rose-500";
};

const getMasteryLabel = (score: number) => {
  if (score > 80) return "Mastered";
  if (score >= 40) return "Learning";
  return "Needs Practice";
};

const TrafficLightBadge = ({ score }: { score: number }) => {
  if (score > 80)
    return (
      <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        {getMasteryLabel(score)}
      </div>
    );
  if (score >= 40)
    return (
      <div className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
        <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
        {getMasteryLabel(score)}
      </div>
    );
  return (
    <div className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
      {getMasteryLabel(score)}
    </div>
  );
};

export default function SubjectMap({
  chapters = [],
  subject = "Mathematics",
}: SubjectMapProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{subject} Chapters</h2>
        <p className="text-gray-500">Track your mastery across all topics</p>
      </div>

      <div className="space-y-3">
        {chapters.map((chapter) => {
          const isLocked = chapter.status === "locked";
          const isExpanded = expandedId === chapter.id;

          return (
            <div
              key={chapter.id}
              className={`
                rounded-xl transition-all duration-300 transform
                ${
                  isLocked
                    ? "opacity-50 bg-gray-100 cursor-not-allowed"
                    : "bg-white hover:shadow-lg hover:scale-102"
                }
                ${
                  !isLocked
                    ? `border-l-4 border-l-${
                        chapter.masteryScore > 80
                          ? "green"
                          : chapter.masteryScore >= 40
                          ? "yellow"
                          : "red"
                      }-500`
                    : "border-l-4 border-l-gray-300"
                }
                shadow-md overflow-hidden
              `}
            >
              {/* Main Card */}
              <div
                className="p-4 cursor-pointer"
                onClick={() =>
                  !isLocked && setExpandedId(isExpanded ? null : chapter.id)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {isLocked ? (
                      <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center text-2xl">
                        🔒
                      </div>
                    ) : (
                      <div
                        className={`
                          w-12 h-12 rounded-lg flex items-center justify-center text-2xl
                          bg-gradient-to-br ${getMasteryColor(chapter.masteryScore)}
                        `}
                      >
                        {chapter.masteryScore > 80 ? "✓" : "📚"}
                      </div>
                    )}

                    <div className="flex-1">
                      <h3
                        className={`font-bold ${
                          isLocked ? "text-gray-500" : "text-gray-800"
                        }`}
                      >
                        {chapter.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        {!isLocked && <TrafficLightBadge score={chapter.masteryScore} />}
                        {isLocked && (
                          <span className="text-xs text-gray-500">
                            Complete previous chapter to unlock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mastery Score & Chevron */}
                  {!isLocked && (
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-800">
                          {chapter.masteryScore}%
                        </p>
                        <p className="text-xs text-gray-500">mastery</p>
                      </div>
                      <span
                        className={`text-2xl transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      >
                        ›
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {!isLocked && (
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 bg-gradient-to-r ${getMasteryColor(
                        chapter.masteryScore
                      )}`}
                      style={{ width: `${chapter.masteryScore}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Expandable Details */}
              {isExpanded && !isLocked && (
                <div className="border-t bg-gradient-to-br from-blue-50 to-indigo-50 p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Topics Covered</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {chapter.topicsCount || 12}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Questions Done</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {chapter.questionsCompleted || 8}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/student/chapter/${chapter.id}`}
                    className={`
                      block w-full py-3 px-4 rounded-lg font-semibold text-center
                      transition-all duration-200 text-white
                      bg-gradient-to-r ${getMasteryColor(chapter.masteryScore)}
                      hover:shadow-lg active:scale-95
                    `}
                  >
                    {chapter.masteryScore === 100 ? "Review Chapter" : "Continue Learning"} →
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {chapters.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500 text-lg">No chapters available yet</p>
          <p className="text-gray-400 text-sm mt-1">Check back soon!</p>
        </div>
      )}
    </div>
  );
}
