"use client";
import { useState } from "react";
import Link from "next/link";

interface Insight {
  text: string;
  type: "positive" | "neutral" | "concern"; // concern = red alert
  actionable?: boolean;
}

interface NarrativeReportProps {
  insights: Insight[];
  weekStartDate?: string;
  childName?: string;
}

const getInsightColor = (type: string) => {
  switch (type) {
    case "positive":
      return "from-green-50 to-emerald-50 border-l-4 border-l-green-500";
    case "concern":
      return "from-red-50 to-rose-50 border-l-4 border-l-red-500";
    default:
      return "from-blue-50 to-indigo-50 border-l-4 border-l-blue-500";
  }
};

const getInsightIcon = (type: string) => {
  switch (type) {
    case "positive":
      return "✅";
    case "concern":
      return "⚠️";
    default:
      return "ℹ️";
  }
};

export default function NarrativeReport({
  insights = [],
  weekStartDate = "Dec 18 - Dec 24, 2025",
  childName = "Rahul",
}: NarrativeReportProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">📊</span>
          <h2 className="text-2xl font-bold text-gray-800">Weekly Summary</h2>
        </div>
        <p className="text-sm text-gray-500">{weekStartDate}</p>
        <p className="text-sm text-gray-600 mt-2">
          Here's what we observed this week for <strong>{childName}</strong>
        </p>
      </div>

      {/* Insights Cards */}
      <div className="space-y-4">
        {insights.map((insight, index) => {
          const isExpanded = expandedIndex === index;
          const Icon = getInsightIcon(insight.type);

          return (
            <div
              key={index}
              className={`
                bg-gradient-to-r ${getInsightColor(insight.type)}
                rounded-xl p-4 transition-all duration-300 cursor-pointer
                hover:shadow-md
              `}
              onClick={() =>
                setExpandedIndex(isExpanded ? null : index)
              }
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{Icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{insight.text}</p>
                  {insight.actionable && (
                    <p className="text-xs text-gray-600 mt-1">
                      💡 Tap to see actionable tips
                    </p>
                  )}
                </div>
                <span className={`text-lg flex-shrink-0 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}>
                  ↓
                </span>
              </div>

              {/* Expanded Section */}
              {isExpanded && insight.actionable && (
                <div className="mt-4 pt-4 border-t border-gray-200 border-opacity-30">
                  <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-700">
                      {insight.type === "positive"
                        ? `That's amazing! ${childName} is making great progress. Keep up the motivation!`
                        : `We noticed ${childName} might be struggling here. Try practicing a few more questions or explaining the concept differently.`}
                    </p>
                  </div>
                  <Link
                    href={`/parent/practice-session/${index}`}
                    className="inline-block px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors"
                  >
                    📝 Practice This Topic
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {insights.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No data yet for this week</p>
          <p className="text-gray-400 text-sm mt-1">
            Check back after {childName} completes some quizzes
          </p>
        </div>
      )}

      {/* Summary Footer */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mt-6 border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-700">
            <strong>Bottom Line:</strong> {childName} is learning well! Continue
            encouraging daily practice and celebrate small wins.
          </p>
        </div>
      )}
    </div>
  );
}
