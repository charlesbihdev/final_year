"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User } from 'lucide-react'
import type { Student } from "@/types"

interface StudentSelectorProps {
  students: Student[]
  selectedStudentId: string
  onStudentChange: (studentId: string) => void
}

export function StudentSelector({ students, selectedStudentId, onStudentChange }: StudentSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Select Student
        </CardTitle>
        <CardDescription>Choose a student to manage their course enrollments</CardDescription>
      </CardHeader>
      <CardContent>
        <select 
          value={selectedStudentId} 
          onChange={(e) => onStudentChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Choose a student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id.toString()}>
              {student.index_number} - {student.name}
            </option>
          ))}
        </select>
      </CardContent>
    </Card>
  )
}
