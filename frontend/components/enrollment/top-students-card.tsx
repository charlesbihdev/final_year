"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Student, StudentCourse } from "@/types"

interface TopStudentsCardProps {
  students: Student[]
  enrollments: StudentCourse[]
}

export function TopStudentsCard({ students, enrollments }: TopStudentsCardProps) {
  const studentEnrollmentCounts = students.map(student => ({
    ...student,
    enrollmentCount: enrollments.filter(e => e.student_id === student.id).length
  })).sort((a, b) => b.enrollmentCount - a.enrollmentCount)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Most Active Students</CardTitle>
        <CardDescription>Students with most course enrollments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {studentEnrollmentCounts.slice(0, 5).map((student) => (
            <div key={student.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{student.name || 'Unknown'}</div>
                <div className="text-sm text-gray-500">{student.index_number}</div>
              </div>
              <Badge variant="secondary">{student.enrollmentCount} courses</Badge>
            </div>
          ))}
          {studentEnrollmentCounts.length === 0 && (
            <p className="text-gray-500 text-center py-4">No enrollments yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
