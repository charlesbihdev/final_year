"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { FileSpreadsheet, Filter, CalendarIcon, RotateCcw } from "lucide-react"
import { api } from "@/lib/api"
import type { AttendanceRecord, Student, Course, ExamSession } from "@/types"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { CSVParser } from "@/lib/csv-utils"

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

  const columns = [
    {
      key: "student.user.name",
      label: "Student Name",
      render: (record: AttendanceRecord) => record.student?.user?.name || "N/A",
    },
    {
      key: "student.student_id",
      label: "Student ID",
      render: (record: AttendanceRecord) => record.student?.student_id || "N/A",
    },
    {
      key: "session.course.title",
      label: "Course",
      render: (record: AttendanceRecord) => record.session?.course?.title || "N/A",
    },
    {
      key: "session.date",
      label: "Session Date",
      render: (record: AttendanceRecord) => (record.session ? format(new Date(record.session.date), "PPP") : "N/A"),
    },
    {
      key: "timestamp",
      label: "Time Recorded",
      render: (record: AttendanceRecord) => format(new Date(record.timestamp), "Pp"),
    },
    {
      key: "status",
      label: "Status",
      render: (record: AttendanceRecord) => (
        <Badge variant={record.status === "present" ? "default" : "secondary"}>{record.status}</Badge>
      ),
    },
    {
      key: "method",
      label: "Method",
      render: (record: AttendanceRecord) => <Badge variant="outline">{record.method}</Badge>,
    },
  ]

  const exportToCSV = () => {
    const headers = [
      "Student Name",
      "Student ID",
      "Course Code",
      "Course Title",
      "Session Date",
      "Session Start Time",
      "Session End Time",
      "Time Recorded",
      "Status",
      "Method",
    ]
    const rows = filteredRecords.map((record) => [
      record.student?.user?.name || "",
      record.student?.student_id || "",
      record.session?.course?.code || "",
      record.session?.course?.title || "",
      record.session ? format(new Date(record.session.date), "yyyy-MM-dd") : "",
      record.session?.start_time || "",
      record.session?.end_time || "",
      format(new Date(record.timestamp), "yyyy-MM-dd HH:mm:ss"),
      record.status,
      record.method,
    ])

    const csvContent = CSVParser.generateTemplate(headers, rows)
    CSVParser.downloadFile(csvContent, `attendance_report_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`)
  }

  return (
    <AdminLayout currentPage="attendance">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Attendance Reports</h2>
          <p className="text-gray-600">View and export attendance records</p>
        </div>

        {/* Filters and Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Overview
            </CardTitle>
            <CardDescription>Filter records and see attendance statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Native HTML select for Session filter */}
              <div className="relative">
                <select
                  value={filters.sessionId}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sessionId: e.target.value }))}
                  className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                >
                  <option value="">All Sessions</option>
                  {sessions
                    .map((session) => {
                      const idValue = session.id
                      const stringId = String(idValue)
                      if (idValue === null || idValue === undefined || stringId.trim() === "") {
                        return null
                      }
                      return (
                        <option key={stringId} value={stringId}>
                          {session.course?.code} - {format(new Date(session.date), "PPP")} ({session.start_time})
                        </option>
                      )
                    })
                    .filter(Boolean)}
                </select>
              </div>

              {/* Native HTML select for Student filter */}
              <div className="relative">
                <select
                  value={filters.studentId}
                  onChange={(e) => setFilters((prev) => ({ ...prev, studentId: e.target.value }))}
                  className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                >
                  <option value="">All Students</option>
                  {students
                    .map((student) => {
                      const idValue = student.id
                      const stringId = String(idValue)
                      if (idValue === null || idValue === undefined || stringId.trim() === "") {
                        return null
                      }
                      return (
                        <option key={stringId} value={stringId}>
                          {student.user?.name} ({student.student_id})
                        </option>
                      )
                    })
                    .filter(Boolean)}
                </select>
              </div>

              {/* Native HTML select for Course filter */}
              <div className="relative">
                <select
                  value={filters.courseId}
                  onChange={(e) => setFilters((prev) => ({ ...prev, courseId: e.target.value }))}
                  className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                >
                  <option value="">All Courses</option>
                  {courses
                    .map((course) => {
                      const idValue = course.id
                      const stringId = String(idValue)
                      if (idValue === null || idValue === undefined || stringId.trim() === "") {
                        return null
                      }
                      return (
                        <option key={stringId} value={stringId}>
                          {course.code} - {course.title}
                        </option>
                      )
                    })
                    .filter(Boolean)}
                </select>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateRange.from && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? (
                      filters.dateRange.to ? (
                        <>
                          {format(filters.dateRange.from, "LLL dd, y")} - {format(filters.dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(filters.dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={filters.dateRange.from}
                    selected={filters.dateRange}
                    onSelect={(range) => setFilters((prev) => ({ ...prev, dateRange: range || {} }))}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                onClick={() => setFilters({ sessionId: "", studentId: "", courseId: "", dateRange: {} })}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Filters
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="text-lg font-semibold text-blue-700">Total Records</div>
                  <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="text-lg font-semibold text-green-700">Present</div>
                  <div className="text-3xl font-bold text-green-900">{stats.present}</div>
                </CardContent>
              </Card>
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="text-lg font-semibold text-red-700">Absent</div>
                  <div className="text-3xl font-bold text-red-900">{stats.absent}</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Records Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                Attendance Records ({filteredRecords.length})
              </CardTitle>
              <CardDescription>Detailed list of all attendance entries</CardDescription>
            </div>
            <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2 bg-transparent">
              <FileSpreadsheet className="w-4 h-4" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredRecords}
              columns={columns}
              isLoading={isLoading}
              searchable={false}
              emptyMessage="No attendance records found matching the current filters."
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
