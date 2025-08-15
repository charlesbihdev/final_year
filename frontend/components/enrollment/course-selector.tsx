"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
        <Select value={selectedCourseId} onValueChange={onCourseChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id.toString()}>
                {course.code} - {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}
