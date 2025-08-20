"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { TextField, SelectField } from "@/components/ui/form-field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api } from "@/lib/api"
import type { Course } from "@/types"

interface CourseFormProps {
  isOpen: boolean
  onClose: () => void
  course?: Course | null
  onSuccess: () => void
}

const departments = [
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Physics', label: 'Physics' },
  { value: 'Chemistry', label: 'Chemistry' }
]

const levels = [
  { value: '100', label: 'Level 100' },
  { value: '200', label: 'Level 200' },
  { value: '300', label: 'Level 300' },
  { value: '400', label: 'Level 400' }
]

export function CourseForm({ isOpen, onClose, course, onSuccess }: CourseFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    level: '',
    department: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (course) {
      const levelStr = course.level ? String(course.level) : ''
      const deptStr = course.department ? String(course.department) : ''
      
      setFormData({
        title: course.title || '',
        code: course.code || '',
        level: levelStr,
        department: deptStr
      })
    } else if (isOpen) {
      setFormData({
        title: '',
        code: '',
        level: '',
        department: ''
      })
    }
    setError('')
  }, [course, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = course
        ? await api.put(`/courses/${course.id}`, formData)
        : await api.post('/courses', formData)

      if (response.success) {
        onSuccess()
      } else {
        setError(response.error || 'Failed to save course')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={course ? 'Edit Course' : 'Create New Course'}
      description={course ? 'Update course information' : 'Add a new course to the system'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Course Title"
          value={formData.title}
          onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
          placeholder="e.g., Introduction to Computer Science"
          required
        />

        <TextField
          label="Course Code"
          value={formData.code}
          onChange={(value) => setFormData(prev => ({ ...prev, code: value }))}
          placeholder="e.g., CS101"
          required
        />

        <SelectField
          key={`department-${course?.id || 'new'}`}
          label="Department"
          value={formData.department}
          onChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
          options={departments}
          placeholder="Select department"
          required
        />

        <SelectField
          key={`level-${course?.id || 'new'}`}
          label="Level"
          value={formData.level}
          onChange={(value) => setFormData(prev => ({ ...prev, level: value }))}
          options={levels}
          placeholder="Select level"
          required
        />

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
