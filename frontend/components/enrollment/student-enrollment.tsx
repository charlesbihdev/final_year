"use client"

import { useState } from "react"
import { StudentSelector } from "./student-selector"
import { StudentInfoCard } from "./student-info-card"
import { EnrolledCoursesTable } from "./enrolled-courses-table"
import { EnrollCoursesModal } from "./enroll-courses-modal"
import { api } from "@/lib/api"
import type { Course, Student, StudentCourse } from "@/types"

interface StudentEnrollmentProps {
  courses: Course[]
  students: Student[]
  enrollments: StudentCourse[]
  isLoading: boolean
  onEnrollmentChange: () => void
}

export function StudentEnrollment({ 
  courses, 
  students, 
  enrollments, 
  isLoading, 
  onEnrollmentChange 
}: StudentEnrollmentProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("")
  const [showEnrollModal, setShowEnrollModal] = useState(false)

  const selectedStudent = students.find(s => s.id.toString() === selectedStudentId)
  const studentEnrollments = enrollments.filter(e => e.student_id.toString() === selectedStudentId)
  const enrolledCourses = courses.filter(c => 
    studentEnrollments.some(e => e.course_id === c.id)
  )
  const availableCourses = courses.filter(c => 
    !studentEnrollments.some(e => e.course_id === c.id)
  )

  const handleUnenroll = async (courseId: number) => {
    if (!selectedStudent) return
    
    if (confirm('Are you sure you want to unenroll from this course?')) {
      const enrollment = enrollments.find(e => 
        e.student_id === selectedStudent.id && e.course_id === courseId
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
      <StudentSelector 
        students={students}
        selectedStudentId={selectedStudentId}
        onStudentChange={setSelectedStudentId}
      />

      {selectedStudent && (
        <>
          <StudentInfoCard
            student={selectedStudent}
            enrolledCount={enrolledCourses.length}
            onEnrollClick={() => setShowEnrollModal(true)}
          />

          <EnrolledCoursesTable
            courses={enrolledCourses}
            isLoading={isLoading}
            onUnenroll={handleUnenroll}
          />

          <EnrollCoursesModal
            isOpen={showEnrollModal}
            onClose={() => setShowEnrollModal(false)}
            student={selectedStudent}
            availableCourses={availableCourses}
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
