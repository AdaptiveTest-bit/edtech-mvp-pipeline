/**
 * Student Context for managing authentication state
 * 
 * This context provides:
 * - Current student session (id, email, name, token)
 * - Authentication state (isAuthenticated, isLoading)
 * - Login/logout functions
 * - Automatic persistence to localStorage
 * 
 * Usage: wrap your app with <StudentProvider>, then use useStudent() hook
 */

"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

// ============================================================================
// TYPES
// ============================================================================

export interface StudentSession {
  id: number;
  email: string;
  name: string;
  token: string;
}

interface StudentContextType {
  // State
  student: StudentSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Methods
  login: (session: StudentSession) => void;
  logout: () => void;
  updateStudent: (student: StudentSession) => void;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const StudentContext = createContext<StudentContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface StudentProviderProps {
  children: ReactNode;
}

export function StudentProvider({ children }: StudentProviderProps) {
  const [student, setStudent] = useState<StudentSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ========================================================================
  // INITIALIZATION: Load from localStorage on mount
  // ========================================================================

  useEffect(() => {
    const stored = localStorage.getItem("edtech_student");
    if (stored) {
      try {
        const parsed: StudentSession = JSON.parse(stored);
        setStudent(parsed);
        console.log("✅ Restored student session from localStorage:", parsed);
      } catch (error) {
        console.error("❌ Failed to parse stored student session:", error);
        localStorage.removeItem("edtech_student");
      }
    }
    setIsLoading(false);
  }, []);

  // ========================================================================
  // METHODS
  // ========================================================================

  /**
   * Login: store student session in state + localStorage
   */
  const login = useCallback((session: StudentSession) => {
    console.log("✅ Student logged in:", session.email);
    setStudent(session);
    localStorage.setItem("edtech_student", JSON.stringify(session));
  }, []);

  /**
   * Logout: clear student session
   */
  const logout = useCallback(() => {
    console.log("✅ Student logged out");
    setStudent(null);
    localStorage.removeItem("edtech_student");
  }, []);

  /**
   * Update student data (e.g., after gaining XP)
   */
  const updateStudent = useCallback((updated: StudentSession) => {
    setStudent(updated);
    localStorage.setItem("edtech_student", JSON.stringify(updated));
  }, []);

  // ========================================================================
  // CONTEXT VALUE
  // ========================================================================

  const value: StudentContextType = {
    student,
    isLoading,
    isAuthenticated: student !== null,
    login,
    logout,
    updateStudent,
  };

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * Use student context in any component
 * 
 * Example:
 * const { student, logout } = useStudent();
 * if (!student) return <Redirect to="/login" />;
 */
export function useStudent(): StudentContextType {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error(
      "⚠️  useStudent must be used within <StudentProvider>. " +
      "Make sure to wrap your app with StudentProvider in layout.tsx"
    );
  }
  return context;
}

export default StudentProvider;
