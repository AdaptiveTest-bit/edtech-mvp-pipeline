"use client";
import { useState } from "react";

interface WeakConcept {
  id: string;
  conceptName: string;
  misconceptionGuide: string;
  failureRate: number; // 0-100
  lastFailedDate?: string;
  topicsRelated?: string[];
}

interface WeaknessRadarProps {
  weakConcepts: WeakConcept[];
  childName?: string;
}

export default function WeaknessRadar({
  weakConcepts = [],
  childName = "Your Child",
}: WeaknessRadarProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <span>🎯</span> Focus Areas
        </h2>
        <p className="text-gray-600">
          Topics where {childName} needs a bit more practice
        </p>
      </div>

      {/* Concepts List */}
      {weakConcepts.length > 0 ? (
        <div className="space-y-3">
          {weakConcepts.map((concept) => {
            const isExpanded = expandedId === concept.id;
            const severityColor = 
              concept.failureRate > 70 
                ? "border-red-500 bg-red-50" 
                : "border-orange-500 bg-orange-50";

            return (
              <div
                key={concept.id}
                className={`
                  border-l-4 ${severityColor}
                  rounded-lg p-4 transition-all duration-300 cursor-pointer
                  hover:shadow-md bg-white
                `}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : concept.id)
                  }
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg">
                      {concept.conceptName}
                    </h3>
                    {concept.lastFailedDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last struggled: {concept.lastFailedDate}
                      </p>
                    )}
                  </div>

                  {/* Severity Badge */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">
                        {concept.failureRate}%
                      </p>
                      <p className="text-xs text-gray-500">failure rate</p>
                    </div>
                    <span
                      className={`text-2xl transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    >
                      ↓
                    </span>
                  </div>
                </div>

                {/* Failure Rate Bar */}
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-500"
                    style={{ width: `${concept.failureRate}%` }}
                  />
                </div>

                {/* Expandable Guide */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {/* Misconception Guide */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        💡 Misconception Guide:
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {concept.misconceptionGuide}
                      </p>
                    </div>

                    {/* Related Topics */}
                    {concept.topicsRelated && concept.topicsRelated.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">
                          Related Topics:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {concept.topicsRelated.map((topic, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <button className="w-full py-2 px-4 bg-gradient-to-r from-orange-400 to-red-500 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow">
                      📝 Practice {concept.conceptName}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-lg p-12 text-center shadow-md">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-gray-600 font-semibold">
            No weak spots identified yet!
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {childName} is performing well across all topics
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-l-yellow-500 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>Tip:</strong> Regular practice in these areas will help build
          confidence. Celebrate progress, not just perfection!
        </p>
      </div>
    </div>
  );
}
