"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Users, RotateCcw, Eye } from 'lucide-react'

interface StudentImportData {
  name: string
  email: string
  student_id: string
  department: string
  level: string
  division: string
}

interface ValidationError {
  row: number
  field: string
  message: string
  data: StudentImportData
}

interface ImportResult {
  success: boolean
  totalRows: number
  successCount: number
  errorCount: number
  errors: ValidationError[]
  successfulStudents: StudentImportData[]
}

interface ImportResultsProps {
  result: ImportResult
  onReset: () => void
  onViewStudents: () => void
}

export function ImportResults({ result, onReset, onViewStudents }: ImportResultsProps) {
  const successRate = result.totalRows > 0 ? (result.successCount / result.totalRows) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            Import Complete
          </CardTitle>
          <CardDescription>
            {result.success 
              ? `Successfully imported ${result.successCount} students`
              : `Import completed with ${result.errorCount} errors`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{result.totalRows}</div>
              <div className="text-sm text-gray-500">Total Rows</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{result.successCount}</div>
              <div className="text-sm text-gray-500">Successful</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{result.errorCount}</div>
              <div className="text-sm text-gray-500">Failed</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Success Rate</span>
              <span className="text-sm text-gray-500">{successRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Details */}
      {result.successCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Successfully Imported ({result.successCount})
            </CardTitle>
            <CardDescription>
              These students have been added to the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {result.successfulStudents.slice(0, 10).map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-gray-600">{student.student_id} | {student.department}</div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Level {student.level}
                  </Badge>
                </div>
              ))}
              {result.successfulStudents.length > 10 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  And {result.successfulStudents.length - 10} more students...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Details */}
      {result.errorCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Import Errors ({result.errorCount})
            </CardTitle>
            <CardDescription>
              These records could not be imported
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {result.errors.map((error, index) => (
                <Alert key={index} className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    <div className="flex items-center justify-between">
                      <span>
                        <strong>Row {error.row}:</strong> {error.message}
                      </span>
                      <Badge variant="destructive">{error.field}</Badge>
                    </div>
                    {error.data.name && (
                      <div className="text-sm mt-1 text-red-600">
                        Student: {error.data.name} ({error.data.student_id})
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={onReset} variant="outline" className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Import More Students
        </Button>
        {result.successCount > 0 && (
          <Button onClick={onViewStudents} className="gap-2 flex-1">
            <Eye className="w-4 h-4" />
            View All Students
          </Button>
        )}
      </div>

      {/* Success Message */}
      {result.success && result.successCount > 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Import completed successfully!</strong> {result.successCount} students have been registered 
            and can now be enrolled in courses and have their attendance tracked.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
