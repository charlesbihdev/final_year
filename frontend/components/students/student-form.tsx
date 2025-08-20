"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { TextField, SelectField } from "@/components/ui/form-field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api } from "@/lib/api"
import type { Student } from "@/types"

interface StudentFormProps {
  isOpen: boolean
  onClose: () => void
  student?: Student | null
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



export function StudentForm({ isOpen, onClose, student, onSuccess }: StudentFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    index_number: '',
    department: '',
    level: '',
    division: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (student) {
        setFormData({
          name: student.name || '',
          email: student.email || '',
          index_number: student.index_number || '',
          department: student.department ? String(student.department) : '',
          level: student.level ? String(student.level) : '',
          division: student.division || ''
        })
      } else {
        setFormData({
          name: '',
          email: '',
          index_number: '',
          department: '',
          level: '',
          division: ''
        })
      }
      setError('')
    }
  }, [student, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = student
        ? await api.put(`/students/${student.id}`, formData)
        : await api.post('/students', formData)

      if (response.success) {
        onSuccess()
      } else {
        setError(response.error || 'Failed to save student')
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
      title={student ? 'Edit Student' : 'Register New Student'}
      description={student ? 'Update student information' : 'Add a new student to the system'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Full Name"
            value={formData.name}
            onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
            placeholder="e.g., John Doe"
            required
          />

          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
            placeholder="e.g., john.doe@university.edu"
          />

          <TextField
            label="Index Number"
            value={formData.index_number}
            onChange={(value) => setFormData(prev => ({ ...prev, index_number: value }))}
            placeholder="e.g., FOE.41.008.209.33"
            required
          />

          <SelectField
            label="Department"
            value={formData.department}
            onChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
            options={departments}
            placeholder="Select department"
          />

          <SelectField
            label="Level"
            value={formData.level}
            onChange={(value) => setFormData(prev => ({ ...prev, level: value }))}
            options={levels}
            placeholder="Select level"
            required
          />

          <TextField
            label="Division"
            value={formData.division}
            onChange={(value) => setFormData(prev => ({ ...prev, division: value.toUpperCase() }))}
            placeholder="e.g., A, B, C, D, E, F, G, H"
            maxLength={2}
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
            {isLoading ? 'Saving...' : student ? 'Update Student' : 'Register Student'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
