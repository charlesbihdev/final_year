"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { CourseList } from "@/components/courses/course-list"
import { CourseForm } from "@/components/courses/course-form"
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
import { api } from "@/lib/api"
import type { Course } from "@/types"

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setIsLoading(true)
    const response = await api.get<Course[]>('/courses')
    if (response.success && response.data) {
      setCourses(response.data)
    }
    setIsLoading(false)
  }

  const handleCreateCourse = () => {
    setEditingCourse(null)
    setShowForm(true)
  }

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course)
    setShowForm(true)
  }

  const handleDeleteCourse = async (courseId: number) => {
    if (confirm('Are you sure you want to delete this course?')) {
      const response = await api.delete(`/courses/${courseId}`)
      if (response.success) {
        fetchCourses()
      }
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingCourse(null)
    fetchCourses()
  }

  return (
    <AdminLayout currentPage="courses">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Course Management</h2>
            <p className="text-gray-600">Create and manage courses</p>
          </div>
          <Button onClick={handleCreateCourse} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Course
          </Button>
        </div>

        <CourseList
          courses={courses}
          isLoading={isLoading}
          onEdit={handleEditCourse}
          onDelete={handleDeleteCourse}
        />

        <CourseForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          course={editingCourse}
          onSuccess={handleFormSuccess}
        />
      </div>
    </AdminLayout>
  )
}
