"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStudent } from "@/context/StudentContext";
import { getStudentMastery } from "@/lib/api";

interface ConceptMastery {
  concept_id: number;
  concept_name: string;
  mastery_score: number;
  leitner_box: number;
  next_review_date: string;
  status: string;
}

interface MasteryData {
  concepts: ConceptMastery[];
}

export default function ProgressPage() {
  const router = useRouter();
  const { student } = useStudent();
  const [data, setData] = useState<MasteryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!student) {
      router.push("/login");
      return;
    }

    const fetchMastery = async () => {
      try {
        const masteryData = await getStudentMastery(student.id);
        setData(masteryData);
      } catch (err) {
        setError("Failed to load progress");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMastery();
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

  if (!data) return null;

  const concepts = data.concepts || [];

  const getLeitnerEmoji = (box: number) => {
    const emojis = ["📚", "🌱", "🌿", "🌳"];
    return emojis[Math.min(box - 1, 3)] || "📚";
  };

  const getStatusColor = (status: string) => {
    return status === "review_needed"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-green-100 text-green-800";
  };

  const getStatusText = (status: string) => {
    return status === "review_needed" ? "⚠️ Review Needed" : "✅ Mastered";
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Concept Progress</h1>
        <p className="text-gray-600 mt-2">
          Track your mastery across all concepts and prepare for spaced repetition
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-medium">Total Concepts</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">{concepts.length}</div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-medium">Mastered</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {concepts.filter((c) => c.status !== "review_needed").length}
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-medium">Need Review</div>
          <div className="text-3xl font-bold text-yellow-600 mt-2">
            {concepts.filter((c) => c.status === "review_needed").length}
          </div>
        </div>
      </div>

      {/* Concepts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {concepts.length > 0 ? (
          concepts.map((concept) => (
            <div
              key={concept.concept_id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">
                  {concept.concept_name}
                </h3>
                <span className="text-2xl flex-shrink-0">
                  {getLeitnerEmoji(concept.leitner_box)}
                </span>
              </div>

              {/* Mastery Score */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Mastery</span>
                  <span className="text-sm font-bold text-gray-900">
                    {(concept.mastery_score * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-blue-400 h-2.5 rounded-full transition-all"
                    style={{ width: `${concept.mastery_score * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Leitner Box Progress */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 font-medium mb-2">
                  Leitner Box: {concept.leitner_box}/4
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((box) => (
                    <div
                      key={box}
                      className={`flex-1 h-2 rounded transition-all ${
                        box <= concept.leitner_box ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Review Status */}
              <div className="mb-3">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    concept.status
                  )}`}
                >
                  {getStatusText(concept.status)}
                </span>
              </div>

              {/* Next Review Date */}
              <div className="text-xs text-gray-600 pt-3 border-t border-gray-200">
                Next review: {new Date(concept.next_review_date).toLocaleDateString()}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600">No concepts available yet</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
        <h3 className="font-semibold text-blue-900 mb-2">💡 About Leitner Boxes</h3>
        <p className="text-sm text-blue-800">
          Your concepts are organized into 4 boxes based on spaced repetition. Box 1 contains concepts you're learning, progressing to Box 4 as you master them. The system reviews older concepts regularly to maintain your mastery.
        </p>
      </div>
    </div>
  );
}
