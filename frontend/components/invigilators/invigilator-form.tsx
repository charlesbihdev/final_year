"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { TextField, SelectField } from "@/components/ui/form-field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api } from "@/lib/api"
import type { Invigilator } from "@/types"

interface InvigilatorFormProps {
  isOpen: boolean
  onClose: () => void
  invigilator?: Invigilator | null
  onSuccess: () => void
}

const departments = [
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Physics', label: 'Physics' },
  { value: 'Chemistry', label: 'Chemistry' }
]

export function InvigilatorForm({ isOpen, onClose, invigilator, onSuccess }: InvigilatorFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    staff_id: '',
    department: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (invigilator) {
      setFormData({
        name: invigilator.user?.name || '',
        email: invigilator.user?.email || '',
        staff_id: invigilator.staff_id,
        department: invigilator.department
      })
    } else {
      setFormData({
        name: '',
        email: '',
        staff_id: '',
        department: ''
      })
    }
    setError('')
  }, [invigilator, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        staff_id: formData.staff_id,
        department: formData.department,
        // Password would typically be handled separately for new users or reset flows
        // For simplicity, we're assuming the API handles user creation/update based on email/staff_id
      }

      const response = invigilator
        ? await api.put(`/invigilators/${invigilator.id}`, payload)
        : await api.post('/invigilators', payload)

      if (response.success) {
        onSuccess()
      } else {
        setError(response.error || 'Failed to save invigilator')
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
      title={invigilator ? 'Edit Invigilator' : 'Register New Invigilator'}
      description={invigilator ? 'Update invigilator information' : 'Add a new invigilator to the system'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Full Name"
            value={formData.name}
            onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
            placeholder="e.g., Jane Doe"
            required
          />

          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
            placeholder="e.g., jane.doe@university.edu"
            required
          />

          <TextField
            label="Staff ID"
            value={formData.staff_id}
            onChange={(value) => setFormData(prev => ({ ...prev, staff_id: value }))}
            placeholder="e.g., INV.001"
            required
          />

          <SelectField
            label="Department"
            value={formData.department}
            onChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
            options={departments}
            placeholder="Select department"
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
            {isLoading ? 'Saving...' : invigilator ? 'Update Invigilator' : 'Register Invigilator'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
