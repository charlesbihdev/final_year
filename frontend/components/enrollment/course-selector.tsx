"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from 'lucide-react'
import type { Course } from "@/types"

interface CourseSelectorProps {
  courses: Course[]
  selectedCourseId: string
  onCourseChange: (courseId: string) => void
}

export function CourseSelector({ courses, selectedCourseId, onCourseChange }: CourseSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Select Course
        </CardTitle>
        <CardDescription>Choose a course to manage its enrollments</CardDescription>
      </CardHeader>
      <CardContent>
        <select 
          value={selectedCourseId} 
          onChange={(e) => onCourseChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Choose a course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id.toString()}>
              {course.code} - {course.title}
            </option>
          ))}
        </select>
      </CardContent>
    </Card>
  )
}
