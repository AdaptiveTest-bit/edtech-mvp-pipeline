"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useStudent } from "@/context/StudentContext";
import SubjectMap from "./SubjectMap";
import { getStudentProgress } from "@/lib/api";

interface Chapter {
  id: string;
  title: string;
  masteryScore: number;
  status: "locked" | "unlocked";
  topicsCount?: number;
  questionsCompleted?: number;
}

/**
 * SubjectMapContainer - Wrapper component for SubjectMap
 * 
 * Responsibilities:
 * - Fetches real student progress from API
 * - Transforms API response to SubjectMap format
 * - Handles loading and error states
 * - Passes data to SubjectMap presentation component
 */
export default function SubjectMapContainer() {
  const { student } = useStudent();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChapters = async () => {
      if (!student) return;

      try {
        setLoading(true);
        setError(null);
        console.log(`📚 Fetching chapters for student ${student.id}...`);

        // Fetch real progress data
        const progressData = await getStudentProgress(student.id);

        // Transform API response to SubjectMap format
        const transformedChapters: Chapter[] = progressData.chapters.map(
          (chapter) => ({
            id: chapter.chapter_id.toString(),
            title: chapter.name,
            masteryScore: Math.round(chapter.mastery_score),
            status: chapter.status as "locked" | "unlocked",
            topicsCount: undefined, // API doesn't provide this yet
            questionsCompleted: chapter.questions_completed,
          })
        );

        setChapters(transformedChapters);
        console.log(`✅ Loaded ${transformedChapters.length} chapters:`, transformedChapters);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load chapters";
        console.error("❌ Error fetching chapters:", errorMessage);
        setError(errorMessage);
        toast.error(errorMessage);
        setChapters([]); // Reset chapters on error
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, [student?.id]);

  // Show loading state
  if (loading) {
    return (
      <div className="w-full p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading your chapters...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full p-8 bg-red-50 rounded-lg border border-red-200">
        <h3 className="text-red-800 font-semibold">Error Loading Chapters</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // Render SubjectMap with real data
  return (
    <SubjectMap chapters={chapters} subject="Mathematics" />
  );
}
