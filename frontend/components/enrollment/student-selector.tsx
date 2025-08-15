"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
        <Select value={selectedStudentId} onValueChange={onStudentChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a student" />
          </SelectTrigger>
          <SelectContent>
            {students.map((student) => (
              <SelectItem key={student.id} value={student.id.toString()}>
                {student.student_id} - {student.user?.name || 'Unknown'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}
