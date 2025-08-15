"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen } from 'lucide-react'
import type { Student } from "@/types"

interface StudentInfoCardProps {
  student: Student
  enrolledCount: number
  onEnrollClick: () => void
}

export function StudentInfoCard({ student, enrolledCount, onEnrollClick }: StudentInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{student.user?.name || 'Unknown'}</CardTitle>
            <CardDescription>
              {student.student_id} | {student.department} | 
              Level {student.level} | Division {student.division}
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{enrolledCount}</div>
              <div className="text-sm text-gray-500">Courses</div>
            </div>
            <Button onClick={onEnrollClick} className="gap-2">
              <BookOpen className="w-4 h-4" />
              Enroll Courses
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
