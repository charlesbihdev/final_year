"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { Users } from 'lucide-react'
import type { Student } from "@/types"

interface EnrolledStudentsTableProps {
  students: Student[]
  isLoading: boolean
  onUnenroll: (studentId: number) => void
}

export function EnrolledStudentsTable({ students, isLoading, onUnenroll }: EnrolledStudentsTableProps) {
  const columns = [
    {
      key: 'student_id',
      label: 'Student ID'
    },
    {
      key: 'user.name',
      label: 'Name',
      render: (student: Student) => student.user?.name || '-'
    },
    {
      key: 'department',
      label: 'Department'
    },
    {
      key: 'level',
      label: 'Level',
      render: (student: Student) => (
        <Badge variant="secondary">Level {student.level}</Badge>
      )
    },
    {
      key: 'division',
      label: 'Division',
      render: (student: Student) => (
        <Badge variant="outline">{student.division}</Badge>
      )
    }
  ]

  const actions = (student: Student) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onUnenroll(student.id)}
      className="text-red-600 hover:text-red-700"
    >
      Unenroll
    </Button>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Enrolled Students ({students.length})
        </CardTitle>
        <CardDescription>Students currently enrolled in this course</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          data={students}
          columns={columns}
          actions={actions}
          isLoading={isLoading}
          searchPlaceholder="Search enrolled students..."
          emptyMessage="No students enrolled in this course yet."
        />
      </CardContent>
    </Card>
  )
}
