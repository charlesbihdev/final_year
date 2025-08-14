"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Camera, Users } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

export default function AttendancePage() {
  // All hooks must be at the top, before any conditional logic
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{
    matched: boolean
    similarity: number
    student?: {
      student_name: string
      index_number: string
    }
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isLoading) {
      if (user?.role === 'admin') {
        router.push('/admin/courses')
      } else if (!user) {
        router.push('/login')
      }
    }
  }, [user, isLoading, router])

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    setResult(null)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const submitAttendance = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append("photo", selectedFile)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/recognize`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      })

      const data = await response.json()
      console.log("API Response:", data)
      setResult(data)
    } catch (error) {
      console.error("Error submitting attendance:", error)
      setResult({
        matched: false,
        similarity: 0,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setPreview(null)
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Handle authentication redirect (this will redirect, but we still need to render something)
  if (user?.role === 'admin' || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Student Attendance</h1>
          <p className="text-gray-600">Take or upload a photo to mark attendance</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-2">
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full gap-2 bg-transparent">
              <Users className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
        </div>

        {/* Photo Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Capture Photo
            </CardTitle>
            <CardDescription>Take a photo or upload from gallery</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload */}
            <div>
              <Label htmlFor="upload">Capture / Upload from Gallery</Label>
              <Input
                ref={fileInputRef}
                id="upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="mt-1"
              />
            </div>

            {/* Preview */}
            {preview && (
              <div className="space-y-3">
                <div className="relative">
                  <img
                    src={preview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={submitAttendance} disabled={isProcessing} className="flex-1">
                    {isProcessing ? "Processing..." : "Submit Attendance"}
                  </Button>
                  <Button onClick={resetForm} variant="outline">
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading */}
        {isProcessing && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="text-center text-sm text-gray-600">Analyzing photo...</div>
                <Progress value={undefined} className="w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && !isProcessing && (
          <Card>
            <CardContent className="pt-6">
              {result.matched ? (
                <div className="space-y-4">
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">
                      <div className="font-semibold">Match Found!</div>
                      <div className="text-sm mt-1">
                        Confidence:
                        {(result.similarity * 100).toFixed(2)}%
                      </div>
                    </AlertDescription>
                  </Alert>

                  {result.student && (
                    <div className="bg-white p-4 rounded-lg border space-y-2">
                      <div className="font-semibold text-lg">{result.student.student_name}</div>
                      <div className="text-gray-600">{result.student.index_number}</div>
                      <div className="text-sm text-gray-500">Attendance marked at {new Date().toLocaleString()}</div>
                    </div>
                  )}
                </div>
              ) : (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    <div className="font-semibold">No Match Found</div>
                    <div className="text-sm mt-1">
                      No such user exists in the database.
                      {result.similarity > 0 && ` Confidence: ${(result.similarity * 100).toFixed(2)}%`}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
