"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { AttendanceStats, AttendanceFilters, AttendanceTable } from "@/components/admin/attendance"
import { api } from "@/lib/api"
import type { AttendanceRecord, Student, Course, ExamSession } from "@/types"

interface FilterOptions {
  sessionId: string
  studentId: string
  courseId: string
  dateRange: { from?: Date; to?: Date }
}

export default function AttendanceReportsPage() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [sessions, setSessions] = useState<ExamSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<FilterOptions>({
    sessionId: "",
    studentId: "",
    courseId: "",
    dateRange: {},
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [recordsRes, studentsRes, coursesRes, sessionsRes] = await Promise.all([
        api.get<AttendanceRecord[]>("/attendance-records"),
        api.get<Student[]>("/students"),
        api.get<Course[]>("/courses"),
        api.get<ExamSession[]>("/sessions"),
      ])

      if (recordsRes.success && recordsRes.data) setAttendanceRecords(recordsRes.data)
      if (studentsRes.success && studentsRes.data) setStudents(studentsRes.data)
      if (coursesRes.success && coursesRes.data) setCourses(coursesRes.data)
      if (sessionsRes.success && sessionsRes.data) setSessions(sessionsRes.data)
    } catch (error) {
      console.error("Error fetching attendance data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = (records: AttendanceRecord[]) => {
    return records.filter((record) => {
      const recordDate = new Date(record.timestamp)

      const matchesSession = filters.sessionId ? record.session_id.toString() === filters.sessionId : true
      const matchesStudent = filters.studentId ? record.student_id.toString() === filters.studentId : true
      const matchesCourse = filters.courseId ? record.session?.course_id.toString() === filters.courseId : true

      const matchesDateRange =
        (!filters.dateRange.from || recordDate >= filters.dateRange.from) &&
        (!filters.dateRange.to || recordDate <= filters.dateRange.to)

      return matchesSession && matchesStudent && matchesCourse && matchesDateRange
    })
  }

  const filteredRecords = applyFilters(attendanceRecords)

  const getAttendanceStats = () => {
    const total = filteredRecords.length
    const present = filteredRecords.filter((record) => record.status === "present").length
    const absent = total - present
    return { total, present, absent }
  }

  const stats = getAttendanceStats()

  return (
    <AdminLayout currentPage="attendance">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Attendance Reports</h2>
          <p className="text-gray-600">View and export attendance records</p>
        </div>

        <AttendanceStats 
          total={stats.total}
          present={stats.present}
          absent={stats.absent}
        />

        <AttendanceFilters
          filters={filters}
          onFiltersChange={setFilters}
          students={students}
          courses={courses}
          sessions={sessions}
          isLoading={isLoading}
        />

        <AttendanceTable
          records={filteredRecords}
          isLoading={isLoading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>
    </AdminLayout>
  )
}
