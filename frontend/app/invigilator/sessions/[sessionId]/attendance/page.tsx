"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Keep Input for search
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Search,
  UserCheck,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { api } from "@/lib/api"; // Import api client
import type { Student, ExamSession, AttendanceRecord } from "@/types";

// Mock data for development (will be replaced by API calls)
const mockSessions = {
  "1": {
    id: 1,
    course_id: 1,
    date: "2023-12-15",
    start_time: "09:00",
    end_time: "11:00",
    is_active: true,
    course: {
      id: 1,
      title: "Introduction to Computer Science",
      code: "CS101",
      level: "100",
      department: "Computer Science",
    },
  },
  "2": {
    id: 2,
    course_id: 2,
    date: "2023-12-16",
    start_time: "14:00",
    end_time: "16:00",
    is_active: true,
    course: {
      id: 2,
      title: "Calculus I",
      code: "MATH201",
      level: "200",
      department: "Mathematics",
    },
  },
  "3": {
    id: 3,
    course_id: 3,
    date: "2023-12-18",
    start_time: "10:00",
    end_time: "12:00",
    is_active: false,
    course: {
      id: 3,
      title: "Physics for Engineers",
      code: "PHY301",
      level: "300",
      department: "Physics",
    },
  },
};

const mockStudents: Student[] = [
  {
    id: 1,
    user_id: 101,
    student_id: "CS/2023/001",
    department: "Computer Science",
    level: "100",
    division: "A",
    user: {
      id: 101,
      name: "Alice Johnson",
      email: "alice@example.com",
      role: "student",
    },
  },
  {
    id: 2,
    user_id: 102,
    student_id: "CS/2023/002",
    department: "Computer Science",
    level: "100",
    division: "A",
    user: {
      id: 102,
      name: "Bob Smith",
      email: "bob@example.com",
      role: "student",
    },
  },
  {
    id: 3,
    user_id: 103,
    student_id: "CS/2023/003",
    department: "Computer Science",
    level: "100",
    division: "B",
    user: {
      id: 103,
      name: "Charlie Brown",
      email: "charlie@example.com",
      role: "student",
    },
  },
  {
    id: 4,
    user_id: 104,
    student_id: "CS/2023/004",
    department: "Computer Science",
    level: "100",
    division: "B",
    user: {
      id: 104,
      name: "Diana Prince",
      email: "diana@example.com",
      role: "student",
    },
  },
  {
    id: 5,
    user_id: 105,
    student_id: "MATH/2023/001",
    department: "Mathematics",
    level: "200",
    division: "A",
    user: {
      id: 105,
      name: "Edward Norton",
      email: "edward@example.com",
      role: "student",
    },
  },
  {
    id: 6,
    user_id: 106,
    student_id: "MATH/2023/002",
    department: "Mathematics",
    level: "200",
    division: "A",
    user: {
      id: 106,
      name: "Fiona Apple",
      email: "fiona@example.com",
      role: "student",
    },
  },
  {
    id: 7,
    user_id: 107,
    student_id: "PHY/2023/001",
    department: "Physics",
    level: "300",
    division: "A",
    user: {
      id: 107,
      name: "George Lucas",
      email: "george@example.com",
      role: "student",
    },
  },
  {
    id: 8,
    user_id: 108,
    student_id: "PHY/2023/002",
    department: "Physics",
    level: "300",
    division: "A",
    user: {
      id: 108,
      name: "Hannah Montana",
      email: "hannah@example.com",
      role: "student",
    },
  },
];

// Mock attendance records from backend (simulating IoT and manual entries)
let mockBackendAttendanceRecords: AttendanceRecord[] = [
  {
    id: 1,
    student_id: 1,
    session_id: 1,
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    method: "face",
    student: mockStudents[0],
    session: mockSessions["1"],
    status: "present",
  },
  {
    id: 2,
    student_id: 2,
    session_id: 1,
    timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    method: "fingerprint",
    student: mockStudents[1],
    session: mockSessions["1"],
    status: "present",
  },
  {
    id: 3,
    student_id: 5,
    session_id: 2,
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    method: "face",
    student: mockStudents[4],
    session: mockSessions["2"],
    status: "present",
  },
];

export default function MarkAttendancePage() {
  const params = useParams();
  const sessionId = parseInt(params.sessionId as string);

  const [session, setSession] = useState<ExamSession | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to fetch all necessary data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setSubmitResult(null); // Clear previous results

    try {
      // Simulate fetching session details
      const sessionData =
        mockSessions[sessionId as unknown as keyof typeof mockSessions];
      setSession(sessionData);

      // Simulate fetching enrolled students for the session's course
      // In a real app, this would be an API call like /courses/{courseId}/students
      const studentsForSession = mockStudents.filter(
        (student) => student.department === sessionData?.course?.department
      );
      setEnrolledStudents(studentsForSession);

      // Simulate fetching attendance records for the current session
      // In a real app, this would be an API call like /sessions/{sessionId}/attendance-records
      const sessionAttendance = mockBackendAttendanceRecords.filter(
        (record) => record.session_id === sessionId
      );
      setAttendanceRecords(sessionAttendance);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSubmitResult({
        success: false,
        message: "Failed to load session data.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // Initial data fetch on component mount
  useEffect(() => {
    fetchData();
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchData]);

  // Polling effect based on session.is_active
  useEffect(() => {
    if (session?.is_active) {
      // Start polling if session is active
      pollingIntervalRef.current = setInterval(() => {
        console.log("Polling for new attendance records...");
        // In a real app, this would be an API call to get latest records
        // For mock, we just re-fetch all data to simulate updates
        fetchData();
      }, 5000); // Poll every 5 seconds
    } else {
      // Stop polling if session is inactive
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
    // Cleanup function to clear interval when component unmounts or session.is_active changes
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [session?.is_active, fetchData]); // Depend on session.is_active and fetchData

  const handleToggleSession = async (activate: boolean) => {
    setIsLoading(true);
    setSubmitResult(null);

    try {
      const updatedSession = { ...session!, is_active: activate };
      mockSessions[sessionId as keyof typeof mockSessions] = updatedSession; // Update mock data
      setSession(updatedSession);

      setSubmitResult({
        success: true,
        message: `Session ${activate ? "started" : "stopped"} successfully!`,
      });
    } catch (error) {
      console.error("Error toggling session:", error);
      setSubmitResult({
        success: false,
        message: `Failed to ${activate ? "start" : "stop"} session.`,
      });
    } finally {
      setIsLoading(false);
      fetchData();
    }
  };

  const handleMarkPresent = async (studentId: number) => {
    setIsLoading(true);
    setSubmitResult(null);
    try {
      const newRecord: AttendanceRecord = {
        id: Math.max(...mockBackendAttendanceRecords.map((r) => r.id)) + 1, // Simple ID generation
        student_id: studentId,
        session_id: sessionId,
        timestamp: new Date().toISOString(),
        method: "manual",
        status: "present",
        student: enrolledStudents.find((s) => s.id === studentId), // Attach student for mock display
        session: session ?? undefined, // Attach session for mock display
      };

      // Simulate POST to backend
      mockBackendAttendanceRecords.push(newRecord);

      setSubmitResult({
        success: true,
        message: `Attendance marked present for ${
          enrolledStudents.find((s) => s.id === studentId)?.user?.name
        }!`,
      });
    } catch (error) {
      console.error("Error marking present:", error);
      setSubmitResult({
        success: false,
        message: "Failed to mark attendance present.",
      });
    } finally {
      setIsLoading(false);
      fetchData(); // Re-fetch data to reflect change
    }
  };

  const handleMarkAbsent = async (recordId: number) => {
    setIsLoading(true);
    setSubmitResult(null);
    try {
      // Simulate DELETE to backend
      mockBackendAttendanceRecords = mockBackendAttendanceRecords.filter(
        (record) => record.id !== recordId
      );

      setSubmitResult({
        success: true,
        message: "Attendance marked absent (manual record removed)!",
      });
    } catch (error) {
      console.error("Error marking absent:", error);
      setSubmitResult({
        success: false,
        message: "Failed to mark attendance absent.",
      });
    } finally {
      setIsLoading(false);
      fetchData(); // Re-fetch data to reflect change
    }
  };

  // Prepare student list with their current attendance status
  const studentsWithStatus = enrolledStudents.map((student) => {
    const record = attendanceRecords.find(
      (rec) => rec.student_id === student.id
    );
    return {
      ...student,
      attendanceStatus: record ? "present" : "absent",
      attendanceMethod: record?.method,
      attendanceTimestamp: record?.timestamp,
      attendanceRecordId: record?.id, // Store record ID for deletion
    };
  });

  const filteredStudents = studentsWithStatus.filter(
    (student) =>
      student.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate attendance statistics
  const totalStudents = enrolledStudents.length;
  const presentCount = studentsWithStatus.filter(
    (item) => item.attendanceStatus === "present"
  ).length;
  const absentCount = totalStudents - presentCount;
  const attendancePercentage =
    totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  if (isLoading && !session) {
    // Only show full loading if initial session data isn't there
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attendance page...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <Alert className="border-red-200 bg-red-50 max-w-md">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Session not found or invalid.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/invigilator/dashboard">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Mark Attendance
            </h1>
            <p className="text-gray-600">
              Session: {session.course?.code} - {session.course?.title} on{" "}
              {format(new Date(session.date), "PPP")}
            </p>
          </div>
        </div>

        {/* Session Control & Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Session Control
            </CardTitle>
            <CardDescription>
              Start or stop the session to enable/disable attendance tracking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant={session.is_active ? "default" : "secondary"}>
                {session.is_active ? "Session Active" : "Session Inactive"}
              </Badge>
              <div className="flex gap-2">
                <Link
                  className={`${!session.is_active && "hidden"}`}
                  href={`/invigilator/sessions/${session.id}/mark`}
                >
                  <Button
                    disabled={!session.is_active}
                    className=""
                    variant="default"
                  >
                    Mark Attendance
                  </Button>
                </Link>

                <Button
                  onClick={() => handleToggleSession(!session.is_active)}
                  disabled={isLoading}
                  className="gap-2"
                  variant={session.is_active ? "outline" : "default"}
                >
                  {session.is_active ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Stop Session
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Start Session
                    </>
                  )}
                </Button>
              </div>
            </div>
            {!session.is_active && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Start the session to begin real-time attendance tracking.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Attendance Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Attendance Summary
            </CardTitle>
            <CardDescription>
              Current attendance statistics for this session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-700">
                  {totalStudents}
                </div>
                <div className="text-sm text-gray-600">Total Enrolled</div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-700">
                  {presentCount}
                </div>
                <div className="text-sm text-gray-600">Present</div>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-700">
                  {absentCount}
                </div>
                <div className="text-sm text-gray-600">Absent</div>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-700">
                  {attendancePercentage}%
                </div>
                <div className="text-sm text-gray-600">Attendance Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Attendance List
            </CardTitle>
            <CardDescription>
              Real-time attendance updates from IoT and manual overrides.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search students by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Student List */}
            <div className="max-h-[60vh] overflow-y-auto space-y-3 border rounded-lg p-4">
              {filteredStudents.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  {searchTerm
                    ? "No students found matching your search"
                    : "No students enrolled in this session."}
                </p>
              ) : (
                filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-white"
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {student.user?.name || "Unknown"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.student_id}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={
                          student.attendanceStatus === "present"
                            ? "default"
                            : "secondary"
                        }
                        className="min-w-[80px] text-center"
                      >
                        {student.attendanceStatus === "present"
                          ? "Present"
                          : "Absent"}
                      </Badge>
                      {student.attendanceStatus === "present" && (
                        <div className="text-xs text-gray-500">
                          {student.attendanceMethod === "manual"
                            ? "Manual"
                            : "IoT"}{" "}
                          at{" "}
                          {format(
                            new Date(student.attendanceTimestamp!),
                            "HH:mm:ss"
                          )}
                        </div>
                      )}
                      {student.attendanceStatus === "absent" &&
                        session.is_active && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkPresent(student.id)}
                            className="gap-1"
                            disabled={isLoading}
                          >
                            <UserCheck className="w-3 h-3" />
                            Mark Present
                          </Button>
                        )}
                      {student.attendanceStatus === "present" &&
                        student.attendanceMethod === "manual" &&
                        session.is_active && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleMarkAbsent(student.attendanceRecordId!)
                            }
                            className="gap-1 text-red-600 hover:text-red-700"
                            disabled={isLoading}
                          >
                            <RotateCcw className="w-3 h-3" />
                            Mark Absent
                          </Button>
                        )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {submitResult && (
              <Alert
                className={`mt-4 ${
                  submitResult.success
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                {submitResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription
                  className={
                    submitResult.success ? "text-green-800" : "text-red-800"
                  }
                >
                  {submitResult.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
