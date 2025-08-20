"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, LogOut, UserCheck, RefreshCw, AlertCircle } from "lucide-react";
import type { ExamSession } from "@/types";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { invigilatorService } from "@/lib/services/invigilator-service";
import { useAuth } from "@/lib/auth";

export default function InvigilatorDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [assignedSessions, setAssignedSessions] = useState<ExamSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionAttendance, setSessionAttendance] = useState<
    Record<number, { present: number; total: number }>
  >({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    fetchAssignedSessions();
  }, [user?.id]);

  const fetchAssignedSessions = async () => {
    if (!user?.id) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await invigilatorService.getAssignedSessions(user.id);

    if (response.success && response.data) {
      setAssignedSessions(response.data);
      await fetchAttendanceData(response.data);
    } else {
      setError(response.error || "Failed to fetch assigned sessions");
      setAssignedSessions([]);
    }

    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAssignedSessions();
    setIsRefreshing(false);
  };

  const fetchAttendanceData = async (sessions: ExamSession[]) => {
    const attendanceData: Record<number, { present: number; total: number }> =
      {};

    for (const session of sessions) {
      const response = await invigilatorService.getSessionAttendance(
        session.id
      );

      if (response.success && response.data) {
        attendanceData[session.id] = {
          present: response.data.present,
          total: response.data.total,
        };
      } else {
        console.warn(
          `Failed to fetch attendance for session ${session.id}:`,
          response.error
        );
        attendanceData[session.id] = { present: 0, total: 0 };
      }
    }

    setSessionAttendance(attendanceData);
  };

  const columns = [
    {
      key: "course.title",
      label: "Course",
      render: (session: ExamSession) => (
        <div>
          <div className="font-medium">{session.course?.title || "-"}</div>
          <div className="text-sm text-gray-500">{session.course?.code}</div>
        </div>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (session: ExamSession) => format(new Date(session.date), "PPP"),
    },
    {
      key: "time",
      label: "Time",
      render: (session: ExamSession) =>
        `${session.start_time} - ${session.end_time}`,
    },
    {
      key: "is_active",
      label: "Status",
      render: (session: ExamSession) => (
        <Badge variant={session.is_active ? "default" : "secondary"}>
          {session.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "attendance",
      label: "Attendance",
      render: (session: ExamSession) => {
        const attendance = sessionAttendance[session.id];
        if (!attendance) return "Loading...";

        const percentage = attendance.total > 0 
          ? Math.round((attendance.present / attendance.total) * 100)
          : 0;

        return (
          <div className="text-sm">
            <div className="font-medium">
              {attendance.present}/{attendance.total} Present
            </div>
            <div className="text-gray-500">{percentage}% Attendance</div>
          </div>
        );
      },
    },
  ];

  const actions = (session: ExamSession) => (
    <Link href={`/invigilator/sessions/${session.id}/attendance`}>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        disabled={!session.is_active}
      >
        <UserCheck className="w-4 h-4" />
        Mark Attendance
      </Button>
    </Link>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Invigilator Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome, {user?.name}. Here are your assigned exam sessions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="flex items-center justify-between">
                <span>{error}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefresh}
                  className="ml-4"
                >
                  Try Again
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Assigned Sessions List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Your Assigned Sessions ({assignedSessions.length})
            </CardTitle>
            <CardDescription>
              Upcoming and active exam sessions you are assigned to invigilate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={assignedSessions}
              columns={columns}
              actions={actions}
              isLoading={isRefreshing}
              searchable={true}
              searchPlaceholder="Search sessions by course, date, or status..."
              emptyMessage={
                error 
                  ? "Unable to load sessions. Please try refreshing." 
                  : "You are not currently assigned to any exam sessions."
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
