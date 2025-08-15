"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Search } from 'lucide-react'
import { api } from "@/lib/api"
import type { Course, Student } from "@/types"

interface EnrollCoursesModalProps {
  isOpen: boolean
  onClose: () => void
  student: Student
  availableCourses: Course[]
  onSuccess: () => void
}

export function EnrollCoursesModal({ 
  isOpen, 
  onClose, 
  student, 
  availableCourses, 
  onSuccess 
}: EnrollCoursesModalProps) {
  const [selectedCourses, setSelectedCourses] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const filteredCourses = availableCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCourseToggle = (courseId: number) => {
    setSelectedCourses(prev => 
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  const handleSelectAll = () => {
    if (selectedCourses.length === filteredCourses.length) {
      setSelectedCourses([])
    } else {
      setSelectedCourses(filteredCourses.map(c => c.id))
    }
  }

  const handleEnroll = async () => {
    if (selectedCourses.length === 0) {
      setError("Please select at least one course")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const enrollmentData = selectedCourses.map(courseId => ({
        student_id: student.id,
        course_id: courseId
      }))

      const response = await api.post('/enrollments/bulk', { enrollments: enrollmentData })

      if (response.success) {
        onSuccess()
      } else {
        setError(response.error || 'Failed to enroll in courses')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedCourses([])
    setSearchTerm("")
    setError("")
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Enroll in Courses"
      description={`Add courses for ${student.user?.name || 'student'}`}
      size="lg"
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Select All */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectedCourses.length === filteredCourses.length && filteredCourses.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all">Select All ({filteredCourses.length})</Label>
          </div>
          <Badge variant="secondary">{selectedCourses.length} selected</Badge>
        </div>

        {/* Course List */}
        <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-4">
          {filteredCourses.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {searchTerm ? 'No courses found matching your search' : 'No available courses to enroll in'}
            </p>
          ) : (
            filteredCourses.map((course) => (
              <div
                key={course.id}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
              >
                <Checkbox
                  id={`course-${course.id}`}
                  checked={selectedCourses.includes(course.id)}
                  onCheckedChange={() => handleCourseToggle(course.id)}
                />
                <div className="flex-1">
                  <div className="font-medium">{course.title}</div>
                  <div className="text-sm text-gray-500">
                    {course.code} | {course.department} | Level {course.level}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleEnroll} 
            disabled={isLoading || selectedCourses.length === 0} 
            className="flex-1"
          >
            {isLoading ? 'Enrolling...' : `Enroll in ${selectedCourses.length} Courses`}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
