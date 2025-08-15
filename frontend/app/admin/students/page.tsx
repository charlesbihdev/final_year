"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { StudentList } from "@/components/students/student-list"
import { StudentForm } from "@/components/students/student-form"
import { FaceCapture } from "@/components/students/face-capture"
import { BulkStudentImport } from "@/components/bulk-import/bulk-student-import"
import { TrainModel } from "@/components/students/train-model" // New import for TrainModel
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Upload, Users, Camera } from 'lucide-react' // Added Camera icon for clarity
import { api } from "@/lib/api"
import type { Student } from "@/types"

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showFaceCapture, setShowFaceCapture] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [activeTab, setActiveTab] = useState("list")

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    setIsLoading(true)
    const response = await api.get<Student[]>('/students')
    if (response.success && response.data) {
      setStudents(response.data)
    }
    setIsLoading(false)
  }

  const handleCreateStudent = () => {
    setEditingStudent(null)
    setShowForm(true)
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setShowForm(true)
  }

  const handleDeleteStudent = async (studentId: number) => {
    if (confirm('Are you sure you want to delete this student?')) {
      const response = await api.delete(`/students/${studentId}`)
      if (response.success) {
        fetchStudents()
      }
    }
  }

  const handleCaptureFace = (student: Student) => {
    setSelectedStudent(student)
    setShowFaceCapture(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingStudent(null)
    fetchStudents()
  }

  const handleFaceCaptureSuccess = () => {
    setShowFaceCapture(false)
    setSelectedStudent(null)
    fetchStudents()
  }

  const handleImportComplete = () => {
    fetchStudents()
    setActiveTab("list") // Switch back to list view after successful import
  }

  const handleTrainingComplete = () => {
    fetchStudents() // Refresh student list after training
    setActiveTab("list") // Optionally switch back to list view
  }

  return (
    <AdminLayout currentPage="students">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Student Management</h2>
            <p className="text-gray-600">Register students and manage their information</p>
          </div>
          <Button onClick={handleCreateStudent} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Student
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3"> {/* Changed to 3 columns */}
            <TabsTrigger value="list" className="gap-2">
              <Users className="w-4 h-4" />
              Student List
            </TabsTrigger>
            <TabsTrigger value="bulk-import" className="gap-2">
              <Upload className="w-4 h-4" />
              Bulk Import
            </TabsTrigger>
            <TabsTrigger value="train-model" className="gap-2"> {/* New Tab Trigger */}
              <Camera className="w-4 h-4" />
              Train Model
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <StudentList
              students={students}
              isLoading={isLoading}
              onEdit={handleEditStudent}
              onDelete={handleDeleteStudent}
              onCaptureFace={handleCaptureFace}
            />
          </TabsContent>

          <TabsContent value="bulk-import">
            <BulkStudentImport onImportComplete={handleImportComplete} />
          </TabsContent>

          <TabsContent value="train-model"> {/* New Tab Content */}
            <TrainModel onTrainingComplete={handleTrainingComplete} />
          </TabsContent>
        </Tabs>

        <StudentForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          student={editingStudent}
          onSuccess={handleFormSuccess}
        />

        <FaceCapture
          isOpen={showFaceCapture}
          onClose={() => setShowFaceCapture(false)}
          student={selectedStudent}
          onSuccess={handleFaceCaptureSuccess}
        />
      </div>
    </AdminLayout>
  )
}
