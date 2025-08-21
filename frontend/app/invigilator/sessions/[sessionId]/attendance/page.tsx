"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  Camera,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

import { 
  AttendanceProvider, 
  useAttendance,
  AttendanceOverview,
  FaceRecognitionTab,
  ManualAttendanceTab 
} from "@/components/attendance";

function AttendancePageContent() {
  const router = useRouter();
  const { 
    session, 
    isLoading, 
    error, 
    submitResult, 
    toggleSessionStatus 
  } = useAttendance();

  const handleToggleSession = async () => {
    if (session) {
      await toggleSessionStatus(!session.is_active);
    }
  };

  if (isLoading && !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{error}</p>
            <div className="flex gap-2">
              <Button onClick={() => router.back()} variant="outline">
                Go Back
              </Button>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/invigilator">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {session.course?.title} - Attendance
            </h1>
            <p className="text-gray-600">
              {format(new Date(session.date), "PPP")} • {session.start_time} - {session.end_time}
            </p>
            {/* Display divisions and rooms */}
            {session.divisions && session.divisions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {session.divisions.map((division) => (
                  <Badge key={division.id} variant="outline" className="text-xs">
                    Division {division.division}
                    {division.room_number && (
                      <span className="ml-1">• Room {division.room_number}</span>
                    )}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={session.is_active ? "default" : "secondary"}>
              {session.is_active ? "Active" : "Inactive"}
            </Badge>
            <Button
              variant={session.is_active ? "destructive" : "default"}
              onClick={handleToggleSession}
              disabled={isLoading}
              className="gap-2"
            >
              {session.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {session.is_active ? "Stop Session" : "Start Session"}
            </Button>
          </div>
            </div>

        {/* Status Alert */}
            {submitResult && (
          <Alert className={submitResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                {submitResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
            <AlertDescription className={submitResult.success ? "text-green-800" : "text-red-800"}>
                  {submitResult.message}
                </AlertDescription>
              </Alert>
            )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="gap-2">
              <Users className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="face-recognition" className="gap-2">
              <Camera className="w-4 h-4" />
              Face Recognition
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-2">
              <UserCheck className="w-4 h-4" />
              Manual Entry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AttendanceOverview />
          </TabsContent>

          <TabsContent value="face-recognition">
            <FaceRecognitionTab />
          </TabsContent>

          <TabsContent value="manual">
            <ManualAttendanceTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function MarkAttendancePage() {
  const params = useParams();
  const sessionId = parseInt(params.sessionId as string);

  return (
    <AttendanceProvider sessionId={sessionId}>
      <AttendancePageContent />
    </AttendanceProvider>
  );
}
