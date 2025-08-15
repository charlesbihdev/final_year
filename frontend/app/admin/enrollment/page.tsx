"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { EnrollmentOverview } from "@/components/enrollment/enrollment-overview"
import { CourseEnrollment } from "@/components/enrollment/course-enrollment"
import { StudentEnrollment } from "@/components/enrollment/student-enrollment"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/lib/api"
import type { Course, Student, StudentCourse } from "@/types"

export default function EnrollmentPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [enrollments, setEnrollments] = useState<StudentCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [coursesRes, studentsRes, enrollmentsRes] = await Promise.all([
        api.get<Course[]>('/courses'),
        api.get<Student[]>('/students'),
        api.get<StudentCourse[]>('/enrollments')
      ])

      if (coursesRes.success && coursesRes.data) setCourses(coursesRes.data)
      if (studentsRes.success && studentsRes.data) setStudents(studentsRes.data)
      if (enrollmentsRes.success && enrollmentsRes.data) setEnrollments(enrollmentsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnrollmentChange = () => {
    fetchData() // Refresh all data when enrollments change
  }

  return (
    <AdminLayout currentPage="enrollment">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Course Enrollment</h2>
          <p className="text-gray-600">Manage student course enrollments</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="by-course">By Course</TabsTrigger>
            <TabsTrigger value="by-student">By Student</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <EnrollmentOverview
              courses={courses}
              students={students}
              enrollments={enrollments}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="by-course">
            <CourseEnrollment
              courses={courses}
              students={students}
              enrollments={enrollments}
              isLoading={isLoading}
              onEnrollmentChange={handleEnrollmentChange}
            />
          </TabsContent>

          <TabsContent value="by-student">
            <StudentEnrollment
              courses={courses}
              students={students}
              enrollments={enrollments}
              isLoading={isLoading}
              onEnrollmentChange={handleEnrollmentChange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
