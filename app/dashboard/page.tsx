"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Download, Users, Clock, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

interface Student {
  id: string
  indexNumber: string
  name: string
  timeReported: string
  status: "present" | "absent"
}

interface ClassData {
  id: string
  name: string
  students: Student[]
}

export default function DashboardPage() {
  const [classes, setClasses] = useState<ClassData[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/classes`)
      const data = await response.json()
      setClasses(data)
      if (data.length > 0) {
        setSelectedClass(data[0].id)
      }
    } catch (error) {
      console.error("Error fetching classes:", error)
      // Mock data for demo
      const mockData = [
        {
          id: "cs101",
          name: "Computer Science 101",
          students: [
            {
              id: "1",
              indexNumber: "FOE.41.008.209.33",
              name: "John Doe",
              timeReported: "2024-01-15 09:30:00",
              status: "present" as const,
            },
            {
              id: "2",
              indexNumber: "FOE.41.008.209.34",
              name: "Jane Smith",
              timeReported: "2024-01-15 09:32:00",
              status: "present" as const,
            },
            {
              id: "3",
              indexNumber: "FOE.41.008.209.35",
              name: "Mike Johnson",
              timeReported: "",
              status: "absent" as const,
            },
          ],
        },
        {
          id: "math201",
          name: "Mathematics 201",
          students: [
            {
              id: "4",
              indexNumber: "FOE.41.008.210.01",
              name: "Sarah Wilson",
              timeReported: "2024-01-15 10:15:00",
              status: "present" as const,
            },
            {
              id: "5",
              indexNumber: "FOE.41.008.210.02",
              name: "David Brown",
              timeReported: "",
              status: "absent" as const,
            },
          ],
        },
      ]
      setClasses(mockData)
      setSelectedClass(mockData[0].id)
    } finally {
      setIsLoading(false)
    }
  }

  const currentClass = classes.find((c) => c.id === selectedClass)
  const presentStudents = currentClass?.students.filter((s) => s.status === "present") || []
  const absentStudents = currentClass?.students.filter((s) => s.status === "absent") || []

  const exportToCSV = () => {
    if (!currentClass) return

    const headers = ["Index Number", "Student Name", "Status", "Time Reported"]
    const rows = currentClass.students.map((student) => [
      student.indexNumber,
      student.name,
      student.status,
      student.timeReported ? new Date(student.timeReported).toLocaleString() : "N/A",
    ])

    const csvContent = [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${currentClass.name}_attendance_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportToExcel = () => {
    // For a real implementation, you'd use a library like xlsx
    // For now, we'll export as CSV with .xlsx extension
    exportToCSV()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <div className="text-lg">Loading classes...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Class Dashboard</h1>
            <p className="text-gray-600">Manage attendance for your classes</p>
          </div>
        </div>

        {/* Class Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Select Class
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {currentClass && (
          <>
            {/* Class Header */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">{currentClass.name}</CardTitle>
                    <CardDescription>
                      Total Students: {currentClass.students.length} | Present: {presentStudents.length} | Absent:{" "}
                      {absentStudents.length}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2 bg-transparent">
                      <FileSpreadsheet className="w-4 h-4" />
                      CSV
                    </Button>
                    <Button onClick={exportToExcel} variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Download className="w-4 h-4" />
                      Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Attendance List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Attendance Record
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Present Students */}
                {presentStudents.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-green-700 mb-3">Present ({presentStudents.length})</h3>
                    <div className="space-y-3">
                      {presentStudents.map((student) => (
                        <div key={student.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <div className="font-medium">{student.name}</div>
                              <div className="text-sm text-gray-600">{student.indexNumber}</div>
                            </div>
                            <div className="flex flex-col sm:items-end gap-1">
                              <Badge variant="secondary" className="bg-green-100 text-green-800 w-fit">
                                Present
                              </Badge>
                              <div className="text-xs text-gray-500">
                                {new Date(student.timeReported).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {presentStudents.length > 0 && absentStudents.length > 0 && <Separator />}

                {/* Absent Students */}
                {absentStudents.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-red-700 mb-3">Absent ({absentStudents.length})</h3>
                    <div className="space-y-3">
                      {absentStudents.map((student) => (
                        <div key={student.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <div className="font-medium">{student.name}</div>
                              <div className="text-sm text-gray-600">{student.indexNumber}</div>
                            </div>
                            <Badge variant="secondary" className="bg-red-100 text-red-800 w-fit">
                              Absent
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentClass.students.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No students found in this class.</div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
