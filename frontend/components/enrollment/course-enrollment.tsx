"use client"

import { useState } from "react"
import { CourseSelector } from "./course-selector"
import { CourseInfoCard } from "./course-info-card"
import { EnrolledStudentsTable } from "./enrolled-students-table"
import { EnrollStudentsModal } from "./enroll-students-modal"
import { api } from "@/lib/api"
import type { Course, Student, StudentCourse } from "@/types"

interface CourseEnrollmentProps {
  courses: Course[]
  students: Student[]
  enrollments: StudentCourse[]
  isLoading: boolean
  onEnrollmentChange: () => void
}

export function CourseEnrollment({ 
  courses, 
  students, 
  enrollments, 
  isLoading, 
  onEnrollmentChange 
}: CourseEnrollmentProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")
  const [showEnrollModal, setShowEnrollModal] = useState(false)

  const selectedCourse = courses.find(c => c.id.toString() === selectedCourseId)
  const courseEnrollments = enrollments.filter(e => e.course_id.toString() === selectedCourseId)
  const enrolledStudents = students.filter(s => 
    courseEnrollments.some(e => e.student_id === s.id)
  )
  const availableStudents = students.filter(s => 
    !courseEnrollments.some(e => e.student_id === s.id)
  )

  const handleUnenroll = async (studentId: number) => {
    if (!selectedCourse) return
    
    if (confirm('Are you sure you want to unenroll this student?')) {
      const enrollment = enrollments.find(e => 
        e.course_id === selectedCourse.id && e.student_id === studentId
      )
      
      if (enrollment) {
        const response = await api.delete(`/enrollments/${enrollment.id}`)
        if (response.success) {
          onEnrollmentChange()
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      <CourseSelector 
        courses={courses}
        selectedCourseId={selectedCourseId}
        onCourseChange={setSelectedCourseId}
      />

      {selectedCourse && (
        <>
          <CourseInfoCard
            course={selectedCourse}
            enrolledCount={enrolledStudents.length}
            onEnrollClick={() => setShowEnrollModal(true)}
          />

          <EnrolledStudentsTable
            students={enrolledStudents}
            isLoading={isLoading}
            onUnenroll={handleUnenroll}
          />

          <EnrollStudentsModal
            isOpen={showEnrollModal}
            onClose={() => setShowEnrollModal(false)}
            course={selectedCourse}
            availableStudents={availableStudents}
            onSuccess={() => {
              setShowEnrollModal(false)
              onEnrollmentChange()
            }}
          />
        </>
      )}
    </div>
  )
}
