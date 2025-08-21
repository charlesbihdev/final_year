export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'invigilator'
}

export interface Student {
  id: number
  name: string
  email: string | null
  index_number: string
  department: string | null
  level: 100 | 200 | 300 | 400
  division: 'A' | 'B' | 'C' | 'D'
  fingerprint_id: number | null
  has_face_data?: boolean
}

export interface Course {
  id: number
  title: string
  code: string
  level: 100 | 200 | 300 | 400 | null
  department: string | null
}

export interface StudentCourse {
  id: number
  student_id: number
  course_id: number
  student?: Student
  course?: Course
}

export interface ExamSession {
  id: number
  course_id: number
  date: string
  start_time: string
  end_time: string
  is_active: boolean
  course?: Course
  divisions?: SessionDivision[] // Updated to divisions
}

export interface SessionDivision {
  id: number
  session_id: number
  division: string
  room_number: string | null
  max_capacity: number | null
  invigilators?: Invigilator[]
  student_count?: number
}

export interface AttendanceRecord {
  id: number
  student_id: number
  session_id: number
  session_division_id: number
  timestamp: string
  method: 'face' | 'fingerprint' | 'manual'
  status: 'present' | 'absent'
  student?: Student
  session?: ExamSession
}

export interface FaceData {
  id: number
  student_id: number
  embedding: string
}

export interface Invigilator {
  id: number
  user_id: number
  department: string | null
  user?: User
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
