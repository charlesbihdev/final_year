"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Calendar, LogOut, UserCheck } from 'lucide-react'
import type { ExamSession } from "@/types"
import { format } from "date-fns"
import Link from "next/link"

// Mock data for development until API is ready
const mockSessions: ExamSession[] = [
  {
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
      department: "Computer Science"
    }
  },
  {
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
      department: "Mathematics"
    }
  },
  {
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
      department: "Physics"
    }
  }
];

export default function InvigilatorDashboardPage() {
  const [assignedSessions, setAssignedSessions] = useState<ExamSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Use mock data instead of API call for now
    setTimeout(() => {
      setAssignedSessions(mockSessions);
      setIsLoading(false);
    }, 500); // Simulate loading delay
  }, []);

  const columns = [
    {
      key: 'course.title',
      label: 'Course',
      render: (session: ExamSession) => (
        <div>
          <div className="font-medium">{session.course?.title || '-'}</div>
          <div className="text-sm text-gray-500">{session.course?.code}</div>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (session: ExamSession) => format(new Date(session.date), 'PPP')
    },
    {
      key: 'time',
      label: 'Time',
      render: (session: ExamSession) => `${session.start_time} - ${session.end_time}`
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (session: ExamSession) => (
        <Badge variant={session.is_active ? "default" : "secondary"}>
          {session.is_active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'attendance',
      label: 'Attendance',
      render: (session: ExamSession) => {
        // Mock attendance data
        const present = Math.floor(Math.random() * 30) + 10; // Random number between 10-40
        const total = present + Math.floor(Math.random() * 10); // Add 0-10 absences
        const percentage = Math.round((present / total) * 100);
        
        return (
          <div className="text-sm">
            <div className="font-medium">{present}/{total} Present</div>
            <div className="text-gray-500">{percentage}% Attendance</div>
          </div>
        );
      }
    }
  ]

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
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invigilator Dashboard</h1>
            <p className="text-gray-600">Welcome, John Doe! Here are your assigned exam sessions.</p>
          </div>
          <Button variant="outline" className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Assigned Sessions List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Your Assigned Sessions ({assignedSessions.length})
            </CardTitle>
            <CardDescription>Upcoming and active exam sessions you are assigned to invigilate.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={assignedSessions}
              columns={columns}
              actions={actions}
              isLoading={false}
              searchable={false}
              emptyMessage="You are not currently assigned to any exam sessions."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
