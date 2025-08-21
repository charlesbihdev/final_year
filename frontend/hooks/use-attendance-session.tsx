import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { ExamSession, Student, AttendanceRecord } from "@/types";
import { useAuth } from "@/lib/auth";

export function useAttendanceSession(sessionId: number) {
  const { user } = useAuth();

  const [session, setSession] = useState<ExamSession | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchSessionData();
    }
  }, [sessionId, user?.id]);

  // Start/stop polling based on session activity
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;

    if (session?.is_active) {
      pollInterval = setInterval(() => {
        fetchAttendanceRecords();
      }, 10000); // Poll every 10 seconds
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [session?.is_active]);

  const fetchSessionData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if invigilator is assigned to this session
      const assignedSessionsResponse = await api.get<ExamSession[]>(
        `/invigilators/${user?.id}/sessions`
      );

      if (assignedSessionsResponse.success && assignedSessionsResponse.data) {
        const isAssigned = assignedSessionsResponse.data.some(
          (session) => session.id === sessionId
        );

        if (!isAssigned) {
          throw new Error(
            "You are not assigned to this session. Please contact your administrator."
          );
        }
      }

      // Fetch session details
      const sessionResponse = await api.get<ExamSession>(
        `/sessions/${sessionId}`
      );

      if (!sessionResponse.success || !sessionResponse.data) {
        throw new Error("Session not found");
      }
      setSession(sessionResponse.data);

      // Fetch enrolled students
      const studentsResponse = await api.get<Student[]>(
        `/courses/${sessionResponse.data.course_id}/students`
      );

      if (studentsResponse.success && studentsResponse.data) {
        setEnrolledStudents(studentsResponse.data);
      }

      // Fetch attendance records
      await fetchAttendanceRecords();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load session data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const response = await api.get<AttendanceRecord[]>(
        `/sessions/${sessionId}/attendance-records`
      );
      if (response.success && response.data) {
        setAttendanceRecords(response.data);
      }
    } catch (err) {
      console.warn("Failed to fetch attendance records:", err);
    }
  };

  const toggleSession = async (activate: boolean) => {
    setIsLoading(true);
    try {
      const response = await api.put(`/sessions/${sessionId}`, {
        is_active: activate,
      });

      if (response.success) {
        setSession((prev) => (prev ? { ...prev, is_active: activate } : null));
        return {
          success: true,
          message: `Session ${activate ? "started" : "stopped"} successfully!`,
        };
      } else {
        throw new Error(response.error || "Failed to update session");
      }
    } catch (err) {
      return {
        success: false,
        message:
          err instanceof Error
            ? err.message
            : `Failed to ${activate ? "start" : "stop"} session`,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const markAttendance = async (
    studentId: number,
    method: "manual" | "face" = "manual"
  ) => {
    setIsLoading(true);
    try {
      const response = await api.post(`/sessions/${sessionId}/attendance`, {
        student_id: studentId,
        method: method,
      });

      if (response.success) {
        await fetchAttendanceRecords();
        return { success: true, message: "Attendance marked successfully!" };
      } else {
        throw new Error(response.error || "Failed to mark attendance");
      }
    } catch (err) {
      return {
        success: false,
        message:
          err instanceof Error ? err.message : "Failed to mark attendance",
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    session,
    enrolledStudents,
    attendanceRecords,
    isLoading,
    error,
    toggleSession,
    markAttendance,
    fetchAttendanceRecords,
  };
}
