"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { BookOpen } from 'lucide-react'
import type { Course } from "@/types"

interface EnrolledCoursesTableProps {
  courses: Course[]
  isLoading: boolean
  onUnenroll: (courseId: number) => void
}

export function EnrolledCoursesTable({ courses, isLoading, onUnenroll }: EnrolledCoursesTableProps) {
  const columns = [
    {
      key: 'code',
      label: 'Course Code'
    },
    {
      key: 'title',
      label: 'Title'
    },
    {
      key: 'department',
      label: 'Department'
    },
    {
      key: 'level',
      label: 'Level',
      render: (course: Course) => (
        <Badge variant="secondary">Level {course.level}</Badge>
      )
    }
  ]

  const actions = (course: Course) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onUnenroll(course.id)}
      className="text-red-600 hover:text-red-700"
    >
      Unenroll
    </Button>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Enrolled Courses ({courses.length})
        </CardTitle>
        <CardDescription>Courses this student is currently enrolled in</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          data={courses}
          columns={columns}
          actions={actions}
          isLoading={isLoading}
          searchPlaceholder="Search enrolled courses..."
          emptyMessage="This student is not enrolled in any courses yet."
        />
      </CardContent>
    </Card>
  )
}
