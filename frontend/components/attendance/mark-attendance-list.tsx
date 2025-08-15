"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Search, UserCheck, Save, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react'
import { api } from "@/lib/api"
import type { Student, ExamSession, AttendanceRecord } from "@/types"
import { format } from "date-fns" // Import format for date display

interface MarkAttendanceListProps {
  session: ExamSession
  enrolledStudents: Student[]
  onAttendanceMarked: () => void
}

interface StudentAttendanceState {
  student: Student
  status: 'present' | 'absent' | 'unknown'
  initialStatus: 'present' | 'absent' | 'unknown' // To track changes
}

export function MarkAttendanceList({ session, enrolledStudents, onAttendanceMarked }: MarkAttendanceListProps) {
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendanceState[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    // Initialize attendance state for each student
    const initialAttendance = enrolledStudents.map(student => ({
      student,
      status: 'unknown', // Default to unknown
      initialStatus: 'unknown',
    }))
    setStudentAttendance(initialAttendance)
    setSubmitResult(null) // Reset submit result on session/student change
  }, [session, enrolledStudents])

  const handleStatusChange = (studentId: number, status: 'present' | 'absent') => {
    setStudentAttendance(prev =>
      prev.map(item =>
        item.student.id === studentId ? { ...item, status } : item
      )
    )
  }

  const filteredStudents = studentAttendance.filter(item =>
    item.student.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmitAttendance = async () => {
    setIsLoading(true)
    setSubmitResult(null)

    const recordsToSubmit: Omit<AttendanceRecord, 'id' | 'timestamp' | 'student' | 'session'>[] = studentAttendance
      .filter(item => item.status !== 'unknown' && item.status !== item.initialStatus) // Only submit changed statuses
      .map(item => ({
        student_id: item.student.id,
        session_id: session.id,
        status: item.status,
        method: 'manual', // Assuming manual marking by invigilator
      }))

    if (recordsToSubmit.length === 0) {
      setSubmitResult({ success: false, message: "No attendance changes to submit." })
      setIsLoading(false)
      return
    }

    try {
      // Assuming a bulk attendance submission endpoint
      const response = await api.post('/attendance-records/bulk', { records: recordsToSubmit })

      if (response.success) {
        setSubmitResult({ success: true, message: "Attendance submitted successfully!" })
        onAttendanceMarked() // Notify parent to refresh data
      } else {
        setSubmitResult({ success: false, message: response.error || "Failed to submit attendance." })
      }
    } catch (error) {
      console.error("Error submitting attendance:", error)
      setSubmitResult({ success: false, message: "An unexpected error occurred during submission." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setStudentAttendance(enrolledStudents.map(student => ({
      student,
      status: 'unknown',
      initialStatus: 'unknown',
    })))
    setSearchTerm("")
    setSubmitResult(null)
  }

  // Calculate attendance summary
  const totalStudents = enrolledStudents.length;
  const presentCount = studentAttendance.filter(item => item.status === 'present').length;
  const absentCount = studentAttendance.filter(item => item.status === 'absent').length;
  const unknownCount = totalStudents - presentCount - absentCount;


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Mark Attendance for {session.course?.code} - {format(new Date(session.date), 'PPP')}
          </CardTitle>
          <CardDescription>
            Mark students as present or absent for this session.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Attendance Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="text-lg font-semibold text-blue-700">Total Enrolled</div>
                <div className="text-3xl font-bold text-blue-900">{totalStudents}</div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="text-lg font-semibold text-green-700">Present</div>
                <div className="text-3xl font-bold text-green-900">{presentCount}</div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="text-lg font-semibold text-red-700">Absent</div>
                <div className="text-3xl font-bold text-red-900">{absentCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search students by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Student List */}
          <div className="max-h-[60vh] overflow-y-auto space-y-3 border rounded-lg p-4">
            {filteredStudents.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {searchTerm ? 'No students found matching your search' : 'No students enrolled in this session.'}
              </p>
            ) : (
              filteredStudents.map(item => (
                <div key={item.student.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                  <div className="flex-1">
                    <div className="font-medium">{item.student.user?.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-500">{item.student.student_id}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`present-${item.student.id}`}
                        checked={item.status === 'present'}
                        onCheckedChange={() => handleStatusChange(item.student.id, 'present')}
                      />
                      <Label htmlFor={`present-${item.student.id}`}>Present</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`absent-${item.student.id}`}
                        checked={item.status === 'absent'}
                        onCheckedChange={() => handleStatusChange(item.student.id, 'absent')}
                      />
                      <Label htmlFor={`absent-${item.student.id}`}>Absent</Label>
                    </div>
                    <Badge variant="outline" className="min-w-[60px] text-center">
                      {item.status === 'unknown' ? 'N/A' : item.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>

          {submitResult && (
            <Alert className={`mt-4 ${submitResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              {submitResult.success ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
              <AlertDescription className={submitResult.success ? 'text-green-800' : 'text-red-800'}>
                {submitResult.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleReset} className="flex-1 gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <Button onClick={handleSubmitAttendance} disabled={isLoading} className="flex-1 gap-2">
              <Save className="w-4 h-4" />
              {isLoading ? 'Submitting...' : 'Submit Attendance'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
