"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus } from 'lucide-react'
import type { Course } from "@/types"

interface CourseInfoCardProps {
  course: Course
  enrolledCount: number
  onEnrollClick: () => void
}

export function CourseInfoCard({ course, enrolledCount, onEnrollClick }: CourseInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{course.title}</CardTitle>
            <CardDescription>
              {course.code} | {course.department} | Level {course.level}
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{enrolledCount}</div>
              <div className="text-sm text-gray-500">Enrolled</div>
            </div>
            <Button onClick={onEnrollClick} className="gap-2">
              <UserPlus className="w-4 h-4" />
              Enroll Students
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
