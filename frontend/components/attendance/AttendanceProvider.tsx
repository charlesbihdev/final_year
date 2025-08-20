"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Student, ExamSession, AttendanceRecord } from "@/types";
import { useAuth } from "@/lib/auth";

interface AttendanceContextType {
  // Session data
  session: ExamSession | null;
  sessionId: number;
  
  // Student and attendance data
  enrolledStudents: Student[];
  attendanceRecords: AttendanceRecord[];
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  refreshData: () => Promise<void>;
  markAttendance: (studentId: number, method?: 'manual' | 'face') => Promise<boolean>;
  toggleSessionStatus: (activate: boolean) => Promise<boolean>;
  
  // Status messages
  submitResult: {
    success: boolean;
    message: string;
  } | null;
  setSubmitResult: (result: { success: boolean; message: string; } | null) => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

interface AttendanceProviderProps {
  children: React.ReactNode;
  sessionId: number;
}

export function AttendanceProvider({ children, sessionId }: AttendanceProviderProps) {
  const { user } = useAuth();
  
  // Core state
  const [session, setSession] = useState<ExamSession | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Fetch all session data
  const fetchSessionData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if invigilator is assigned to this session
      const assignedSessionsResponse = await api.get<ExamSession[]>(`/invigilators/${user?.id}/sessions`);
      if (assignedSessionsResponse.success && assignedSessionsResponse.data) {
        const isAssigned = assignedSessionsResponse.data.some(session => session.id === sessionId);
        if (!isAssigned) {
          throw new Error("You are not assigned to this session. Please contact your administrator.");
        }
      }
      
      // Fetch session details
      const sessionResponse = await api.get<ExamSession>(`/sessions/${sessionId}`);
      if (!sessionResponse.success || !sessionResponse.data) {
        throw new Error("Session not found");
      }
      setSession(sessionResponse.data);
      
      // Fetch enrolled students
      const studentsResponse = await api.get<Student[]>(`/courses/${sessionResponse.data.course_id}/students`);
      if (studentsResponse.success && studentsResponse.data) {
        setEnrolledStudents(studentsResponse.data);
      }
      
      // Fetch attendance records
      await fetchAttendanceRecords();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load session data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const response = await api.get<AttendanceRecord[]>(`/sessions/${sessionId}/attendance-records`);
      if (response.success && response.data) {
        setAttendanceRecords(response.data);
      }
    } catch (err) {
      console.warn("Failed to fetch attendance records:", err);
    }
  };

  const markAttendance = async (studentId: number, method: 'manual' | 'face' = 'manual'): Promise<boolean> => {
    setSubmitResult(null);
    
    // Check if student already has attendance marked
    const existingAttendance = attendanceRecords.find(record => record.student_id === studentId);
    if (existingAttendance) {
      setSubmitResult({
        success: false,
        message: `Attendance already marked for this student (${existingAttendance.method})`,
      });
      return false;
    }
    
    try {
      const response = await api.post(`/sessions/${sessionId}/attendance`, {
        student_id: studentId,
        method: method
      });
      
      if (response.success) {
        setSubmitResult({
          success: true,
          message: "Attendance marked successfully!",
        });
        await fetchAttendanceRecords();
        return true;
      } else {
        throw new Error(response.error || "Failed to mark attendance");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to mark attendance";
      
      // Handle specific duplicate constraint error
      if (errorMessage.includes("UNIQUE constraint failed") || errorMessage.includes("already marked")) {
        setSubmitResult({
          success: false,
          message: "Attendance already marked for this student",
        });
      } else {
        setSubmitResult({
          success: false,
          message: errorMessage,
        });
      }
      return false;
    }
  };

  const toggleSessionStatus = async (activate: boolean): Promise<boolean> => {
    setSubmitResult(null);
    
    try {
      const response = await api.put(`/sessions/${sessionId}`, {
        is_active: activate
      });
      
      if (response.success) {
        setSession(prev => prev ? { ...prev, is_active: activate } : null);
        setSubmitResult({
          success: true,
          message: `Session ${activate ? "started" : "stopped"} successfully!`,
        });
        return true;
      } else {
        throw new Error(response.error || "Failed to update session");
      }
    } catch (err) {
      setSubmitResult({
        success: false,
        message: err instanceof Error ? err.message : `Failed to ${activate ? "start" : "stop"} session`,
      });
      return false;
    }
  };

  const refreshData = async () => {
    await fetchAttendanceRecords();
  };

  // Initial data load
  useEffect(() => {
    if (user?.id) {
      fetchSessionData();
    }
  }, [sessionId, user?.id]);

  // Auto-refresh attendance records for active sessions
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (session?.is_active) {
      interval = setInterval(() => {
        fetchAttendanceRecords();
      }, 10000); // Poll every 10 seconds
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [session?.is_active]);

  const contextValue: AttendanceContextType = {
    session,
    sessionId,
    enrolledStudents,
    attendanceRecords,
    isLoading,
    error,
    refreshData,
    markAttendance,
    toggleSessionStatus,
    submitResult,
    setSubmitResult,
  };

  return (
    <AttendanceContext.Provider value={contextValue}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance(): AttendanceContextType {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
} 