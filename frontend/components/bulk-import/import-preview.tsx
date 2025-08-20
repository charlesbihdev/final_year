"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { AlertCircle, CheckCircle, FileText, Upload, RotateCcw } from 'lucide-react'

interface StudentImportData {
  name: string
  email: string
  index_number: string
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

interface ImportPreviewProps {
  file: File | null
  importData: StudentImportData[]
  validationErrors: ValidationError[]
  validRows: StudentImportData[]
  onImport: () => void
  onReset: () => void
}

export function ImportPreview({ 
  file, 
  importData, 
  validationErrors, 
  validRows, 
  onImport, 
  onReset 
}: ImportPreviewProps) {
  const hasErrors = validationErrors.length > 0
  const canImport = validRows.length > 0

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'index_number', label: 'Index Number' },
    { key: 'department', label: 'Department' },
    { key: 'level', label: 'Level' },
    { key: 'division', label: 'Division' }
  ]

  return (
    <div className="space-y-6">
      {/* File Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Import Preview
          </CardTitle>
          <CardDescription>
            Review the data before importing. Fix any errors shown below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">{file?.name}</p>
              <p className="text-sm text-gray-500">
                {importData.length} rows found
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{validRows.length}</div>
                <div className="text-sm text-gray-500">Valid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{validationErrors.length}</div>
                <div className="text-sm text-gray-500">Errors</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {hasErrors && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Validation Errors ({validationErrors.length})
            </CardTitle>
            <CardDescription>
              Please fix these errors before importing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {validationErrors.map((error, index) => (
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
                        Student: {error.data.name} ({error.data.index_number})
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Valid Data Preview */}
      {validRows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Valid Students ({validRows.length})
            </CardTitle>
            <CardDescription>
              These students will be imported
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={validRows.slice(0, 10)} // Show first 10 for preview
              columns={columns}
              searchable={false}
              emptyMessage="No valid students found"
            />
            {validRows.length > 10 && (
              <p className="text-sm text-gray-500 mt-4 text-center">
                Showing first 10 of {validRows.length} valid students
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={onReset} variant="outline" className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Choose Different File
        </Button>
        <Button 
          onClick={onImport} 
          disabled={!canImport}
          className="gap-2 flex-1"
        >
          <Upload className="w-4 h-4" />
          Import {validRows.length} Students
        </Button>
      </div>

      {!canImport && hasErrors && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Please fix the validation errors above before importing.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
