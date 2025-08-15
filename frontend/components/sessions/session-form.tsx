"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { TextField, SelectField } from "@/components/ui/form-field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api } from "@/lib/api"
import type { ExamSession, Course } from "@/types"

interface SessionFormProps {
  isOpen: boolean
  onClose: () => void
  session?: ExamSession | null
  courses: Course[]
  onSuccess: () => void
}

export function SessionForm({ isOpen, onClose, session, courses, onSuccess }: SessionFormProps) {
  const [formData, setFormData] = useState({
    course_id: '',
    date: '',
    start_time: '',
    end_time: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session) {
      setFormData({
        course_id: session.course_id.toString(),
        date: session.date,
        start_time: session.start_time,
        end_time: session.end_time
      })
    } else {
      setFormData({
        course_id: '',
        date: '',
        start_time: '',
        end_time: ''
      })
    }
    setError('')
  }, [session, isOpen])

  const courseOptions = courses.map(course => ({
    value: course.id.toString(),
    label: `${course.code} - ${course.title}`
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const payload = {
        ...formData,
        course_id: parseInt(formData.course_id)
      }

      const response = session
        ? await api.put(`/sessions/${session.id}`, payload)
        : await api.post('/sessions', payload)

      if (response.success) {
        onSuccess()
      } else {
        setError(response.error || 'Failed to save session')
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
      title={session ? 'Edit Session' : 'Create New Session'}
      description={session ? 'Update session information' : 'Create a new exam session'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <SelectField
          label="Course"
          value={formData.course_id}
          onChange={(value) => setFormData(prev => ({ ...prev, course_id: value }))}
          options={courseOptions}
          placeholder="Select course"
          required
        />

        <TextField
          label="Date"
          type="date"
          value={formData.date}
          onChange={(value) => setFormData(prev => ({ ...prev, date: value }))}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Start Time"
            type="time"
            value={formData.start_time}
            onChange={(value) => setFormData(prev => ({ ...prev, start_time: value }))}
            required
          />

          <TextField
            label="End Time"
            type="time"
            value={formData.end_time}
            onChange={(value) => setFormData(prev => ({ ...prev, end_time: value }))}
            required
          />
        </div>

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
            {isLoading ? 'Saving...' : session ? 'Update Session' : 'Create Session'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
