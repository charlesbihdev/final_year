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

interface EnrollStudentsModalProps {
  isOpen: boolean
  onClose: () => void
  course: Course
  availableStudents: Student[]
  onSuccess: () => void
}

export function EnrollStudentsModal({ 
  isOpen, 
  onClose, 
  course, 
  availableStudents, 
  onSuccess 
}: EnrollStudentsModalProps) {
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const filteredStudents = availableStudents.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.index_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleStudentToggle = (studentId: number) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id))
    }
  }

  const handleEnroll = async () => {
    if (selectedStudents.length === 0) {
      setError("Please select at least one student")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const enrollmentData = selectedStudents.map(studentId => ({
        student_id: studentId,
        course_id: course.id
      }))

      const response = await api.post('/enrollments/bulk', { enrollments: enrollmentData })

      if (response.success) {
        onSuccess()
      } else {
        setError(response.error || 'Failed to enroll students')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedStudents([])
    setSearchTerm("")
    setError("")
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Enroll Students"
      description={`Add students to ${course.code} - ${course.title}`}
      size="lg"
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search students..."
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
              checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all">Select All ({filteredStudents.length})</Label>
          </div>
          <Badge variant="secondary">{selectedStudents.length} selected</Badge>
        </div>

        {/* Student List */}
        <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-4">
          {filteredStudents.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {searchTerm ? 'No students found matching your search' : 'No available students to enroll'}
            </p>
          ) : (
            filteredStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
              >
                <Checkbox
                  id={`student-${student.id}`}
                  checked={selectedStudents.includes(student.id)}
                  onCheckedChange={() => handleStudentToggle(student.id)}
                />
                <div className="flex-1">
                  <div className="font-medium">{student.name || 'Unknown'}</div>
                  <div className="text-sm text-gray-500">
                    {student.index_number} | {student.department || 'No Department'} | Level {student.level} | Division {student.division}
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
            disabled={isLoading || selectedStudents.length === 0} 
            className="flex-1"
          >
            {isLoading ? 'Enrolling...' : `Enroll ${selectedStudents.length} Students`}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
