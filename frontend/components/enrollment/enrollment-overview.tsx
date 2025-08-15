"use client"

import { EnrollmentStats } from "./enrollment-stats"
import { TopCoursesCard } from "./top-courses-card"
import { TopStudentsCard } from "./top-students-card"
import type { Course, Student, StudentCourse } from "@/types"

interface EnrollmentOverviewProps {
  courses: Course[]
  students: Student[]
  enrollments: StudentCourse[]
  isLoading: boolean
}

export function EnrollmentOverview({ courses, students, enrollments, isLoading }: EnrollmentOverviewProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <EnrollmentStats courses={[]} students={[]} enrollments={[]} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <EnrollmentStats courses={courses} students={students} enrollments={enrollments} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopCoursesCard courses={courses} enrollments={enrollments} />
        <TopStudentsCard students={students} enrollments={enrollments} />
      </div>
    </div>
  )
}
