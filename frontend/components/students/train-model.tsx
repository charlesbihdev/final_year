"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Search, Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import { api } from "@/lib/api"
import type { Student } from "@/types"

interface TrainModelProps {
  onTrainingComplete: () => void
}

export function TrainModel({ onTrainingComplete }: TrainModelProps) {
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const [trainingPhotos, setTrainingPhotos] = useState<File[]>([])
  const [isTraining, setIsTraining] = useState(false)
  const [trainingResult, setTrainingResult] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchStudents = useCallback(async () => {
    setIsLoadingStudents(true)
    const response = await api.get<Student[]>('/students')
    if (response.success && response.data) {
      setAllStudents(response.data)
    }
    setIsLoadingStudents(false)
  }, [])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setTrainingPhotos((prev) => [...prev, ...files])
    setTrainingResult(null) // Clear previous result on new photo upload
  }

  const removePhoto = (index: number) => {
    setTrainingPhotos((prev) => prev.filter((_, i) => i !== index))
    setTrainingResult(null) // Clear previous result on photo removal
  }

  const handleTraining = async () => {
    if (!selectedStudent || trainingPhotos.length < 5) {
      setTrainingResult("Please select a student and upload at least 5 photos.")
      return
    }

    setIsTraining(true)
    setTrainingResult(null)

    try {
      const formData = new FormData()
      formData.append("student_id", selectedStudent.id.toString())
      trainingPhotos.forEach((file) => formData.append("photos", file))

      const response = await api.uploadFile('/train', formData) // Using the /train endpoint

      if (response.success) {
        setTrainingResult(response.message || "Training completed successfully!")
        setTrainingPhotos([]) // Clear photos on success
        setSelectedStudent(null) // Deselect student on success
        if (fileInputRef.current) fileInputRef.current.value = "" // Clear file input
        onTrainingComplete() // Notify parent component to refresh student list if needed
      } else {
        setTrainingResult(response.error || "Failed to train model.")
      }
    } catch (error) {
      console.error("Error training model:", error)
      setTrainingResult("An unexpected error occurred during training.")
    } finally {
      setIsTraining(false)
    }
  }

  const filteredStudents = allStudents.filter(
    (student) =>
      student.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.department.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Student Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Select Student for Training
          </CardTitle>
          <CardDescription>Search and select a student to train the recognition model</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="search-students">Search Students</Label>
            <Input
              id="search-students"
              placeholder="Search by name, student ID, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1"
            />
          </div>

          {isLoadingStudents ? (
            <div className="text-center text-gray-500 py-8">Loading students...</div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-2">
              {filteredStudents.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No students found.</p>
              ) : (
                filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedStudent?.id === student.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => {
                      setSelectedStudent(student)
                      setTrainingResult(null) // Clear result when selecting new student
                    }}
                  >
                    <div className="font-medium">{student.user?.name}</div>
                    <div className="text-sm text-gray-600">{student.student_id}</div>
                    <div className="text-xs text-gray-500">{student.department} - Level {student.level}</div>
                  </div>
                ))
              )}
            </div>
          )}

          {selectedStudent && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-800">
                <div className="font-semibold">Selected: {selectedStudent.user?.name}</div>
                <div className="text-sm">
                  {selectedStudent.student_id} | {selectedStudent.department} | Level {selectedStudent.level}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Photo Upload and Training */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Training Photos
          </CardTitle>
          <CardDescription>Upload at least 5 photos of the selected student for training</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="photos">Select Photos (minimum 5)</Label>
            <Input
              ref={fileInputRef}
              id="photos"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="mt-1"
            />
          </div>

          {trainingPhotos.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">
                Selected Photos ({trainingPhotos.length}/5+ required)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {trainingPhotos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(photo) || "/placeholder.svg"}
                      alt={`Training photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleTraining}
            disabled={!selectedStudent || trainingPhotos.length < 5 || isTraining}
            className="w-full"
          >
            {isTraining ? "Training Model..." : `Train Model (${trainingPhotos.length}/5+ photos)`}
          </Button>

          {isTraining && (
            <div className="space-y-2">
              <div className="text-center text-sm text-gray-600">Training in progress...</div>
              <Progress value={undefined} className="w-full" />
            </div>
          )}

          {trainingResult && (
            <Alert
              className={`${trainingResult.includes("successfully") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
            >
              {trainingResult.includes("successfully") ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
              <AlertDescription
                className={trainingResult.includes("successfully") ? "text-green-800" : "text-red-800"}
              >
                {trainingResult}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
