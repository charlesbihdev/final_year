"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { api } from "@/lib/api"
import { format } from "date-fns"
import type { ExamSession, Invigilator } from "@/types"

interface AssignInvigilatorsModalProps {
  isOpen: boolean
  onClose: () => void
  session: ExamSession | null
  allInvigilators: Invigilator[]
  onSuccess: () => void
}

export function AssignInvigilatorsModal({
  isOpen,
  onClose,
  session,
  allInvigilators,
  onSuccess,
}: AssignInvigilatorsModalProps) {
  const [selectedInvigilatorIds, setSelectedInvigilatorIds] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (session && session.invigilators) {
      setSelectedInvigilatorIds(session.invigilators.map((inv) => inv.id))
    } else {
      setSelectedInvigilatorIds([])
    }
    setSearchTerm("")
    setError("")
  }, [session, isOpen])

  const filteredInvigilators = allInvigilators.filter(
    (invigilator) =>
      invigilator.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invigilator.staff_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invigilator.department.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleInvigilatorToggle = (invigilatorId: number) => {
    setSelectedInvigilatorIds((prev) =>
      prev.includes(invigilatorId) ? prev.filter((id) => id !== invigilatorId) : [...prev, invigilatorId],
    )
  }

  const handleSelectAll = () => {
    if (selectedInvigilatorIds.length === filteredInvigilators.length) {
      setSelectedInvigilatorIds([])
    } else {
      setSelectedInvigilatorIds(filteredInvigilators.map((inv) => inv.id))
    }
  }

  const handleAssign = async () => {
    if (!session) return

    setIsLoading(true)
    setError("")

    try {
      // Assuming an API endpoint to update invigilators for a session
      const response = await api.put(`/sessions/${session.id}/invigilators`, {
        invigilator_ids: selectedInvigilatorIds,
      })

      if (response.success) {
        onSuccess()
      } else {
        setError(response.error || "Failed to assign invigilators")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedInvigilatorIds([])
    setSearchTerm("")
    setError("")
    onClose()
  }

  if (!session) return null // Don't render if no session is provided

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Assign Invigilators"
      description={`Assign invigilators to ${session.course?.code} - ${format(new Date(session.date), "PPP")} (${session.start_time})`}
      size="lg"
    >
      <div className="space-y-4">
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

        {/* Select All */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all-invigilators"
              checked={selectedInvigilatorIds.length === filteredInvigilators.length && filteredInvigilators.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all-invigilators">Select All ({filteredInvigilators.length})</Label>
          </div>
          <Badge variant="secondary">{selectedInvigilatorIds.length} selected</Badge>
        </div>

        {/* Invigilator List */}
        <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-4">
          {filteredInvigilators.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {searchTerm ? "No invigilators found matching your search" : "No invigilators available"}
            </p>
          ) : (
            filteredInvigilators.map((invigilator) => (
              <div key={invigilator.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <Checkbox
                  id={`invigilator-${invigilator.id}`}
                  checked={selectedInvigilatorIds.includes(invigilator.id)}
                  onCheckedChange={() => handleInvigilatorToggle(invigilator.id)}
                />
                <div className="flex-1">
                  <div className="font-medium">{invigilator.user?.name || "Unknown"}</div>
                  <div className="text-sm text-gray-500">
                    {invigilator.staff_id} | {invigilator.department}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isLoading} className="flex-1">
            {isLoading ? "Assigning..." : `Assign ${selectedInvigilatorIds.length} Invigilators`}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
