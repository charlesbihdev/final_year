"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { TextField } from "@/components/ui/form-field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Plus } from "lucide-react"
import { api } from "@/lib/api"
import type { SessionDivision, ExamSession } from "@/types"

interface SessionDivisionsFormProps {
  isOpen: boolean
  onClose: () => void
  session: ExamSession | null
  onSuccess: () => void
}

interface DivisionFormData {
  division: string
  room_number: string
  max_capacity: string
}

export function SessionDivisionsForm({ isOpen, onClose, session, onSuccess }: SessionDivisionsFormProps) {
  const [divisions, setDivisions] = useState<SessionDivision[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingDivision, setEditingDivision] = useState<SessionDivision | null>(null)
  const [formData, setFormData] = useState<DivisionFormData>({
    division: "",
    room_number: "",
    max_capacity: ""
  })

  useEffect(() => {
    if (session && isOpen) {
      fetchDivisions()
    }
  }, [session, isOpen])

  const fetchDivisions = async () => {
    if (!session) return
    
    try {
      const response = await api.get(`/sessions/${session.id}/divisions`)
      if (response.success && response.data) {
        setDivisions(response.data.divisions || [])
      }
    } catch (error) {
      console.error('Error fetching divisions:', error)
      setError('Failed to load divisions')
    }
  }

  const handleAddDivision = () => {
    setEditingDivision(null)
    setFormData({
      division: "",
      room_number: "",
      max_capacity: ""
    })
    setShowAddForm(true)
  }

  const handleEditDivision = (division: SessionDivision) => {
    setEditingDivision(division)
    setFormData({
      division: division.division,
      room_number: division.room_number || "",
      max_capacity: division.max_capacity?.toString() || ""
    })
    setShowAddForm(true)
  }

  const handleDeleteDivision = async (divisionId: number) => {
    if (!confirm('Are you sure you want to delete this division?')) return
    
         try {
       const response = await api.delete(`/sessions/divisions/${divisionId}`)
       if (response.success) {
         fetchDivisions()
         onSuccess() // Call parent's success callback to refresh sessions list
       } else {
         setError(response.error || 'Failed to delete division')
       }
     } catch (error) {
       setError('An unexpected error occurred')
     }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const payload = {
        division: formData.division.toUpperCase(),
        room_number: formData.room_number.trim() || null,
        max_capacity: formData.max_capacity ? parseInt(formData.max_capacity) : null
      }

      const response = editingDivision
        ? await api.put(`/sessions/divisions/${editingDivision.id}`, payload)
        : await api.post(`/sessions/${session?.id}/divisions`, payload)

             if (response.success) {
         setShowAddForm(false)
         setEditingDivision(null)
         fetchDivisions()
         onSuccess() // Call parent's success callback to refresh sessions list
       } else {
         // Handle specific constraint error
         if (response.error?.includes('UNIQUE constraint failed') || response.error?.includes('division already exists')) {
           setError('A division with this name already exists for this session. Please use a different division name.')
         } else {
           setError(response.error || 'Failed to save division')
         }
       }
     } catch (error) {
       setError('An unexpected error occurred')
     } finally {
       setIsLoading(false)
     }
  }

  const handleClose = () => {
    setShowAddForm(false)
    setEditingDivision(null)
    setError("")
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Manage Session Divisions"
      description={`Manage divisions and room assignments for ${session?.course?.title || 'this session'}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Divisions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Divisions</h3>
            <Button onClick={handleAddDivision} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Division
            </Button>
          </div>

          {divisions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">No divisions created yet. Create divisions to assign rooms.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {divisions.map((division) => (
                <Card key={division.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{division.division}</Badge>
                          {division.room_number && (
                            <Badge variant="secondary">Room {division.room_number}</Badge>
                          )}
                          {division.max_capacity && (
                            <Badge variant="outline">Max: {division.max_capacity}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {division.room_number 
                            ? `Assigned to Room ${division.room_number}`
                            : "No room assigned"
                          }
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditDivision(division)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDivision(division.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingDivision ? 'Edit Division' : 'Add New Division'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <TextField
                    label="Division"
                    value={formData.division}
                    onChange={(value) => setFormData(prev => ({ ...prev, division: value.toUpperCase() }))}
                    placeholder="e.g., A, B, C"
                    maxLength={2}
                    required
                  />

                  <TextField
                    label="Room Number"
                    value={formData.room_number}
                    onChange={(value) => setFormData(prev => ({ ...prev, room_number: value }))}
                    placeholder="e.g., 101, 201, Lab1"
                    required
                  />

                  <TextField
                    label="Max Capacity"
                    type="number"
                    value={formData.max_capacity}
                    onChange={(value) => setFormData(prev => ({ ...prev, max_capacity: value }))}
                    placeholder="e.g., 50"
                    min="1"
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
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? 'Saving...' : editingDivision ? 'Update Division' : 'Add Division'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Close Button */}
        <div className="flex justify-end">
          <Button onClick={handleClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}
