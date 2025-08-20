"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Users, MapPin } from "lucide-react"
import { api } from "@/lib/api"
import { format } from "date-fns"
import type { ExamSession, Invigilator, SessionDivision } from "@/types"

interface AssignInvigilatorsModalProps {
  isOpen: boolean
  onClose: () => void
  session: ExamSession | null
  allInvigilators: Invigilator[]
  onSuccess: () => void
}

interface DivisionAssignment {
  [divisionId: number]: number[] // division ID -> array of invigilator IDs
}

export function AssignInvigilatorsModal({
  isOpen,
  onClose,
  session,
  allInvigilators,
  onSuccess,
}: AssignInvigilatorsModalProps) {
  const [sessionWithDivisions, setSessionWithDivisions] = useState<ExamSession | null>(null)
  const [divisionAssignments, setDivisionAssignments] = useState<DivisionAssignment>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [loadingDivisions, setLoadingDivisions] = useState(false)

  useEffect(() => {
    if (session && isOpen) {
      fetchSessionWithDivisions()
    } else {
      setSessionWithDivisions(null)
      setDivisionAssignments({})
    }
    setSearchTerm("")
    setError("")
  }, [session, isOpen])

  const fetchSessionWithDivisions = async () => {
    if (!session) return
    
    setLoadingDivisions(true)
    try {
      const response = await api.get(`/sessions/${session.id}/divisions`)
      if (response.success && response.data) {
        setSessionWithDivisions(response.data)
        
        // Initialize division assignments from existing data
        const assignments: DivisionAssignment = {}
        if (response.data.divisions) {
          response.data.divisions.forEach((division: SessionDivision) => {
            assignments[division.id] = division.invigilators?.map(inv => inv.id) || []
          })
        }
        setDivisionAssignments(assignments)
      }
    } catch (error) {
      console.error('Error fetching session divisions:', error)
      setError('Failed to load session divisions')
    } finally {
      setLoadingDivisions(false)
    }
  }

  const filteredInvigilators = allInvigilators.filter(
    (invigilator) =>
      invigilator.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invigilator.department?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleInvigilatorToggle = (divisionId: number, invigilatorId: number) => {
    setDivisionAssignments(prev => {
      const current = prev[divisionId] || []
      const updated = current.includes(invigilatorId)
        ? current.filter(id => id !== invigilatorId)
        : [...current, invigilatorId]
      
      return { ...prev, [divisionId]: updated }
    })
  }

  const isInvigilatorAssigned = (divisionId: number, invigilatorId: number) => {
    return divisionAssignments[divisionId]?.includes(invigilatorId) || false
  }

  const isInvigilatorAssignedElsewhere = (currentDivisionId: number, invigilatorId: number) => {
    return Object.entries(divisionAssignments).some(([divId, assignments]) => 
      Number(divId) !== currentDivisionId && assignments.includes(invigilatorId)
    )
  }

  const handleAssign = async () => {
    if (!sessionWithDivisions) return

    setIsLoading(true)
    setError("")

    try {
      // Assign invigilators to each division
      const promises = Object.entries(divisionAssignments).map(([divisionId, invigilatorIds]) => {
        return api.put(`/sessions/divisions/${divisionId}/invigilators`, {
          invigilator_ids: invigilatorIds,
        })
      })

      const results = await Promise.all(promises)
      const hasErrors = results.some(result => !result.success)

      if (hasErrors) {
        setError("Some assignments failed. Please try again.")
      } else {
        onSuccess()
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setDivisionAssignments({})
    setSearchTerm("")
    setError("")
    onClose()
  }

  const getTotalAssignments = () => {
    return Object.values(divisionAssignments).reduce((total, assignments) => total + assignments.length, 0)
  }

  if (!session) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Assign Invigilators by Division"
      description={`Assign invigilators to ${session.course?.code} - ${format(new Date(session.date), "PPP")} (${session.start_time})`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search invigilators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading State */}
        {loadingDivisions ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading divisions...</p>
          </div>
        ) : (
          <>
            {/* Division Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {sessionWithDivisions?.divisions?.map((division) => (
                <Card key={division.id} className="border-2 hover:border-blue-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Division {division.division}
                      </CardTitle>
                      <Badge variant="outline">
                        {divisionAssignments[division.id]?.length || 0} assigned
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      {division.room_number || "No room assigned"} • {division.student_count || 0} students
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {/* Show currently assigned invigilators */}
                    {divisionAssignments[division.id]?.length > 0 && (
                      <div className="mb-3">
                        <Label className="text-xs font-medium text-gray-600">Assigned:</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {divisionAssignments[division.id].map(invId => {
                            const inv = allInvigilators.find(i => i.id === invId)
                            return (
                              <Badge key={invId} variant="default" className="text-xs">
                                {inv?.user?.name || 'Unknown'}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Available invigilators */}
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {filteredInvigilators.map((invigilator) => {
                        const isAssignedHere = isInvigilatorAssigned(division.id, invigilator.id)
                        const isAssignedElsewhere = isInvigilatorAssignedElsewhere(division.id, invigilator.id)
                        const isDisabled = isAssignedElsewhere && !isAssignedHere
                        
                        return (
                          <div key={invigilator.id} className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-50 ${isDisabled ? 'opacity-50' : ''}`}>
                            <Checkbox
                              id={`div-${division.id}-inv-${invigilator.id}`}
                              checked={isAssignedHere}
                              disabled={isDisabled}
                              onCheckedChange={() => !isDisabled && handleInvigilatorToggle(division.id, invigilator.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{invigilator.user?.name || "Unknown"}</div>
                              <div className="text-xs text-gray-500 truncate">
                                {invigilator.department || 'No Department'}
                                {isAssignedElsewhere && (
                                  <span className="ml-2 text-red-500 font-medium">
                                    (Already assigned)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary */}
            {sessionWithDivisions?.divisions && sessionWithDivisions.divisions.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">Assignment Summary</h4>
                    <p className="text-sm text-blue-700">
                      {getTotalAssignments()} invigilators assigned across {sessionWithDivisions.divisions.length} divisions
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {sessionWithDivisions.divisions.filter(div => divisionAssignments[div.id]?.length > 0).length} / {sessionWithDivisions.divisions.length} divisions covered
                  </Badge>
                </div>
              </div>
            )}
          </>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isLoading || loadingDivisions} className="flex-1">
            {isLoading ? "Assigning..." : `Assign ${getTotalAssignments()} Invigilators`}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
