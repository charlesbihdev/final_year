"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Course, StudentCourse } from "@/types"

interface TopCoursesCardProps {
  courses: Course[]
  enrollments: StudentCourse[]
}

export function TopCoursesCard({ courses, enrollments }: TopCoursesCardProps) {
  const courseEnrollmentCounts = courses.map(course => ({
    ...course,
    enrollmentCount: enrollments.filter(e => e.course_id === course.id).length
  })).sort((a, b) => b.enrollmentCount - a.enrollmentCount)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Most Enrolled Courses</CardTitle>
        <CardDescription>Courses with highest student enrollment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courseEnrollmentCounts.slice(0, 5).map((course) => (
            <div key={course.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{course.title}</div>
                <div className="text-sm text-gray-500">{course.code}</div>
              </div>
              <Badge variant="secondary">{course.enrollmentCount} students</Badge>
            </div>
          ))}
          {courseEnrollmentCounts.length === 0 && (
            <p className="text-gray-500 text-center py-4">No enrollments yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
