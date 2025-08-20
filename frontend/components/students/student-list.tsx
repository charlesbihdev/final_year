"use client"

import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Camera } from 'lucide-react'
import type { Student } from "@/types"

interface StudentListProps {
  students: Student[]
  isLoading: boolean
  onEdit: (student: Student) => void
  onDelete: (studentId: number) => void
  onCaptureFace: (student: Student) => void
}

export function StudentList({ students, isLoading, onEdit, onDelete, onCaptureFace }: StudentListProps) {
  const columns = [
    {
      key: 'index_number',
      label: 'Index Number'
    },
    {
      key: 'name',
      label: 'Name'
    },
    {
      key: 'email',
      label: 'Email',
      render: (student: Student) => student.email || '-'
    },
    {
      key: 'department',
      label: 'Department',
      render: (student: Student) => student.department || '-'
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
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onCaptureFace(student)}
        title="Capture Face"
      >
        <Camera className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(student)}
        title="Edit Student"
      >
        <Edit className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(student.id)}
        className="text-red-600 hover:text-red-700"
        title="Delete Student"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )

  return (
    <DataTable
      data={students}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      searchPlaceholder="Search students..."
      emptyMessage="No students found. Register your first student to get started."
    />
  )
}
