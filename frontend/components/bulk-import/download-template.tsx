"use client"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Info } from 'lucide-react'
import { CSVParser } from "@/lib/csv-utils"

export function DownloadTemplate() {
  const handleDownloadTemplate = () => {
    const headers = ['name', 'email', 'index_number', 'department', 'level', 'division']
    const sampleData = [
      ['John Doe', 'john.doe@university.edu', 'FOE.41.008.209.33', 'Computer Science', '200', 'A'],
      ['Jane Smith', 'jane.smith@university.edu', 'FOE.41.008.209.34', 'Computer Science', '200', 'B'],
      ['Bob Wilson', 'bob.wilson@university.edu', 'FOE.41.008.209.35', 'Engineering', '300', 'C'],
      ['Alice Brown', 'alice.brown@university.edu', 'FOE.41.008.209.36', 'Mathematics', '100', 'D'],
      ['Charlie Davis', 'charlie.davis@university.edu', 'FOE.41.008.209.37', 'Physics', '400', 'E'],
      ['Diana Evans', 'diana.evans@university.edu', 'FOE.41.008.209.38', 'Chemistry', '300', 'F'],
      ['Edward Foster', 'edward.foster@university.edu', 'FOE.41.008.209.39', 'Computer Science', '400', 'G'],
      ['Fiona Green', 'fiona.green@university.edu', 'FOE.41.008.209.40', 'Engineering', '200', 'H']
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
          <li><strong>email</strong> - Valid email address (optional)</li>
          <li><strong>index_number</strong> - Unique student index number (e.g., FOE.41.008.209.33)</li>
          <li><strong>department</strong> - Academic department (optional)</li>
          <li><strong>level</strong> - Academic level (100, 200, 300, 400)</li>
          <li><strong>division</strong> - Class division (A, B, C, D, E, F, G, H)</li>
        </ul>
      </div>
    </div>
  )
}
