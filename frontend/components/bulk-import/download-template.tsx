"use client"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Info } from 'lucide-react'
import { CSVParser } from "@/lib/csv-utils"

export function DownloadTemplate() {
  const handleDownloadTemplate = () => {
    const headers = ['name', 'email', 'student_id', 'department', 'level', 'division']
    const sampleData = [
      ['John Doe', 'john.doe@university.edu', 'FOE.41.008.209.33', 'Computer Science', '200', 'A'],
      ['Jane Smith', 'jane.smith@university.edu', 'FOE.41.008.209.34', 'Computer Science', '200', 'A'],
      ['Bob Wilson', 'bob.wilson@university.edu', 'FOE.41.008.209.35', 'Engineering', '300', 'B'],
      ['Alice Brown', 'alice.brown@university.edu', 'FOE.41.008.209.36', 'Mathematics', '100', 'C']
    ]

    const csvContent = CSVParser.generateTemplate(headers, sampleData)
    CSVParser.downloadFile(csvContent, 'student_import_template.csv')
  }

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Download the template CSV file to see the required format and column headers.
          Fill in your student data and upload the file to import multiple students at once.
        </AlertDescription>
      </Alert>

      <Button onClick={handleDownloadTemplate} variant="outline" className="gap-2">
        <Download className="w-4 h-4" />
        Download Template
      </Button>

      <div className="text-sm text-gray-600">
        <p className="font-medium mb-2">Required columns:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>name</strong> - Full name of the student</li>
          <li><strong>email</strong> - Valid email address</li>
          <li><strong>student_id</strong> - Unique student identifier (e.g., FOE.41.008.209.33)</li>
          <li><strong>department</strong> - Academic department</li>
          <li><strong>level</strong> - Academic level (100, 200, 300, 400)</li>
          <li><strong>division</strong> - Class division (A, B, C, D)</li>
        </ul>
      </div>
    </div>
  )
}
