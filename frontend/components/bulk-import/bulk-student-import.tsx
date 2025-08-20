"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { FileUploadZone } from "./file-upload-zone"
import { ImportPreview } from "./import-preview"
import { ImportResults } from "./import-results"
import { DownloadTemplate } from "./download-template"
import { Upload, Users, AlertCircle, CheckCircle } from 'lucide-react'
import { api } from "@/lib/api"
import { CSVParser, StudentCSVValidator, type CSVError } from "@/lib/csv-utils"

interface StudentImportData {
  name: string
  email: string
  index_number: string
  department: string
  level: string
  division: string
}

interface ImportResult {
  success: boolean
  totalRows: number
  successCount: number
  errorCount: number
  errors: CSVError[]
  successfulStudents: StudentImportData[]
}

interface BulkStudentImportProps {
  onImportComplete: () => void
}

export function BulkStudentImport({ onImportComplete }: BulkStudentImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importData, setImportData] = useState<StudentImportData[]>([])
  const [validationErrors, setValidationErrors] = useState<CSVError[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'processing' | 'results'>('upload')

  const requiredHeaders = ['name', 'email', 'index_number', 'department', 'level', 'division']

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile)
    setImportData([])
    setValidationErrors([])
    setImportResult(null)
    
    try {
      const text = await selectedFile.text()
      const { data, errors } = CSVParser.parse<StudentImportData>(
        text,
        requiredHeaders,
        StudentCSVValidator.validate
      )
      
      setImportData(data)
      setValidationErrors(errors)
      setCurrentStep('preview')
    } catch (error) {
      console.error('Error parsing CSV:', error)
      setValidationErrors([{
        row: 0,
        field: 'file',
        message: 'Failed to read CSV file. Please check the file format.',
        data: {}
      }])
      setCurrentStep('preview')
    }
  }

  const handleImport = async () => {
    const validRows = importData.filter((_, index) => 
      !validationErrors.some(error => error.row === index + 2)
    )

    if (validRows.length === 0) {
      return
    }

    setIsProcessing(true)
    setCurrentStep('processing')

    try {
      const response = await api.post<ImportResult>('/students/bulk-import', {
        students: validRows
      })

      if (response.success && response.data) {
        setImportResult(response.data)
        setCurrentStep('results')
        
        if (response.data.successCount > 0) {
          onImportComplete()
        }
      } else {
        setImportResult({
          success: false,
          totalRows: validRows.length,
          successCount: 0,
          errorCount: validRows.length,
          errors: [{
            row: 0,
            field: 'api',
            message: response.error || 'Import failed. Please try again.',
            data: {}
          }],
          successfulStudents: []
        })
        setCurrentStep('results')
      }
    } catch (error) {
      console.error('Import error:', error)
      setImportResult({
        success: false,
        totalRows: validRows.length,
        successCount: 0,
        errorCount: validRows.length,
        errors: [{
          row: 0,
          field: 'system',
          message: 'System error during import. Please contact support if this persists.',
          data: {}
        }],
        successfulStudents: []
      })
      setCurrentStep('results')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setImportData([])
    setValidationErrors([])
    setImportResult(null)
    setCurrentStep('upload')
  }

  const validRows = importData.filter((_, index) => 
    !validationErrors.some(error => error.row === index + 2)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Bulk Student Registration
          </CardTitle>
          <CardDescription>
            Import multiple students from a CSV file. Download the template to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DownloadTemplate />
        </CardContent>
      </Card>

      {/* Step 1: File Upload */}
      {currentStep === 'upload' && (
        <FileUploadZone onFileSelect={handleFileSelect} />
      )}

      {/* Step 2: Preview */}
      {currentStep === 'preview' && (
        <ImportPreview
          file={file}
          importData={importData}
          validationErrors={validationErrors}
          validRows={validRows}
          onImport={handleImport}
          onReset={handleReset}
        />
      )}

      {/* Step 3: Processing */}
      {currentStep === 'processing' && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="text-center">
                <Users className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
                <h3 className="text-lg font-semibold">Importing Students...</h3>
                <p className="text-gray-600">Processing {validRows.length} student records</p>
              </div>
              <Progress value={undefined} className="w-full" />
              <p className="text-sm text-center text-gray-500">
                Please wait while we register the students in the system. This may take a few moments.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Results */}
      {currentStep === 'results' && importResult && (
        <ImportResults
          result={importResult}
          onReset={handleReset}
          onViewStudents={() => onImportComplete()}
        />
      )}
    </div>
  )
}
