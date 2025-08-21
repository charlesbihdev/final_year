"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { SessionList } from "@/components/sessions/session-list"
import { SessionForm } from "@/components/sessions/session-form"
import { SessionDivisionsForm } from "@/components/sessions/session-divisions-form"
import { AssignInvigilatorsModal } from "@/components/sessions/assign-invigilators-modal" // New import
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
import { api } from "@/lib/api"
import type { ExamSession, Course, Invigilator } from "@/types" // Updated import

export default function SessionsPage() {
  const [sessions, setSessions] = useState<ExamSession[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [invigilators, setInvigilators] = useState<Invigilator[]>([]) // New state for invigilators
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showDivisionsForm, setShowDivisionsForm] = useState(false)
  const [showAssignInvigilatorsModal, setShowAssignInvigilatorsModal] = useState(false) // New state for modal
  const [editingSession, setEditingSession] = useState<ExamSession | null>(null)
  const [sessionForDivisions, setSessionForDivisions] = useState<ExamSession | null>(null)
  const [sessionToAssignInvigilators, setSessionToAssignInvigilators] = useState<ExamSession | null>(null) // New state for selected session

  useEffect(() => {
    fetchData() // Combined fetch
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [sessionsRes, coursesRes, invigilatorsRes] = await Promise.all([
        api.get<ExamSession[]>('/sessions'),
        api.get<Course[]>('/courses'),
        api.get<Invigilator[]>('/invigilators'), // Fetch invigilators
      ])

      if (sessionsRes.success && sessionsRes.data) {
        setSessions(sessionsRes.data)
      }
      if (coursesRes.success && coursesRes.data) {
        setCourses(coursesRes.data)
      }
      if (invigilatorsRes.success && invigilatorsRes.data) {
        setInvigilators(invigilatorsRes.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateSession = () => {
    setEditingSession(null)
    setShowForm(true)
  }

  const handleEditSession = (session: ExamSession) => {
    setEditingSession(session)
    setShowForm(true)
  }

  const handleDeleteSession = async (sessionId: number) => {
    if (confirm('Are you sure you want to delete this session?')) {
      const response = await api.delete(`/sessions/${sessionId}`)
      if (response.success) {
        fetchData() // Refresh all data
      }
    }
  }

  const handleToggleSession = async (sessionId: number, isActive: boolean) => {
    const response = await api.put(`/sessions/${sessionId}/toggle`, { is_active: !isActive })
    if (response.success) {
      fetchData() // Refresh all data
    }
  }

  const handleManageDivisions = (session: ExamSession) => {
    setSessionForDivisions(session)
    setShowDivisionsForm(true)
  }

  const handleAssignInvigilators = (session: ExamSession) => {
    setSessionToAssignInvigilators(session)
    setShowAssignInvigilatorsModal(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingSession(null)
    fetchData() // Refresh all data
  }

  const handleDivisionsSuccess = () => {
    setShowDivisionsForm(false)
    setSessionForDivisions(null)
    fetchData()
  }

  const handleAssignInvigilatorsSuccess = () => {
    setShowAssignInvigilatorsModal(false)
    setSessionToAssignInvigilators(null)
    fetchData() // Refresh all data
  }

  return (
    <AdminLayout currentPage="sessions">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Exam Sessions</h2>
            <p className="text-gray-600">Create and manage exam sessions</p>
          </div>
          <Button onClick={handleCreateSession} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Session
          </Button>
        </div>

        <SessionList
          sessions={sessions}
          isLoading={isLoading}
          onEdit={handleEditSession}
          onDelete={handleDeleteSession}
          onToggle={handleToggleSession}
          onManageDivisions={handleManageDivisions}
          onAssignInvigilators={handleAssignInvigilators} // New prop
        />

        <SessionForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          session={editingSession}
          courses={courses}
          onSuccess={handleFormSuccess}
        />

        <SessionDivisionsForm
          isOpen={showDivisionsForm}
          onClose={() => setShowDivisionsForm(false)}
          session={sessionForDivisions}
          onSuccess={handleDivisionsSuccess}
        />

        <AssignInvigilatorsModal
          isOpen={showAssignInvigilatorsModal}
          onClose={() => setShowAssignInvigilatorsModal(false)}
          session={sessionToAssignInvigilators}
          allInvigilators={invigilators}
          onSuccess={handleAssignInvigilatorsSuccess}
        />
      </div>
    </AdminLayout>
  )
}
