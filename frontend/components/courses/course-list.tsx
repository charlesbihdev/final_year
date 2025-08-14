"use client"

import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from 'lucide-react'
import type { Course } from "@/types"

interface CourseListProps {
  courses: Course[]
  isLoading: boolean
  onEdit: (course: Course) => void
  onDelete: (courseId: number) => void
}

export function CourseList({ courses, isLoading, onEdit, onDelete }: CourseListProps) {
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
        <Badge variant="secondary">{course.level}</Badge>
      )
    }
  ]

  const actions = (course: Course) => (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(course)}
      >
        <Edit className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(course.id)}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )

  return (
    <DataTable
      data={courses}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      searchPlaceholder="Search courses..."
      emptyMessage="No courses found. Create your first course to get started."
    />
  )
}
