export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'invigilator' | 'student'
}

export interface Student {
  id: number
  user_id: number
  student_id: string
  department: string
  level: string
  division: string
  user?: User
}

export interface Course {
  id: number
  title: string
  code: string
  level: string
  department: string
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
  invigilators?: Invigilator[] // Added this line
}

export interface AttendanceRecord {
  id: number
  student_id: number
  session_id: number
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
  staff_id: string
  department: string
  user?: User
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
