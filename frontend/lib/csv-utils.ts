export interface CSVParseResult<T> {
  data: T[]
  errors: CSVError[]
}

export interface CSVError {
  row: number
  field: string
  message: string
  data: any
}

export class CSVParser {
  static parse<T>(
    csvText: string,
    requiredHeaders: string[],
    validator: (data: any, row: number) => CSVError[]
  ): CSVParseResult<T> {
    try {
      const lines = csvText.trim().split('\n')
      if (lines.length < 2) {
        return {
          data: [],
          errors: [{
            row: 0,
            field: 'file',
            message: 'CSV file must contain at least a header row and one data row',
            data: {}
          }]
        }
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      
      if (missingHeaders.length > 0) {
        return {
          data: [],
          errors: [{
            row: 0,
            field: 'headers',
            message: `Missing required columns: ${missingHeaders.join(', ')}`,
            data: {}
          }]
        }
      }

      const data: T[] = []
      const errors: CSVError[] = []

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue // Skip empty lines

        const values = this.parseCSVLine(line)
        
        if (values.length !== headers.length) {
          errors.push({
            row: i + 1,
            field: 'format',
            message: `Expected ${headers.length} columns, got ${values.length}`,
            data: {}
          })
          continue
        }

        const rowData: any = {}
        headers.forEach((header, index) => {
          rowData[header] = values[index] || ''
        })

        // Validate row data
        const rowErrors = validator(rowData, i + 1)
        errors.push(...rowErrors)

        data.push(rowData as T)
      }

      return { data, errors }
    } catch (error) {
      return {
        data: [],
        errors: [{
          row: 0,
          field: 'file',
          message: 'Invalid CSV file format or encoding',
          data: {}
        }]
      }
    }
  }

  private static parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++ // Skip next quote
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  }

  static generateTemplate(headers: string[], sampleData: string[][]): string {
    const csvContent = [headers, ...sampleData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    return csvContent
  }

  static downloadFile(content: string, filename: string, type: string = 'text/csv') {
    const blob = new Blob([content], { type })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }
}

export class StudentCSVValidator {
  static validate(student: any, row: number): CSVError[] {
    const errors: CSVError[] = []

    // Name validation
    if (!student.name?.trim()) {
      errors.push({ 
        row, 
        field: 'name', 
        message: 'Name is required', 
        data: student 
      })
    } else if (student.name.trim().length < 2) {
      errors.push({ 
        row, 
        field: 'name', 
        message: 'Name must be at least 2 characters long', 
        data: student 
      })
    }

    // Email validation
    if (!student.email?.trim()) {
      errors.push({ 
        row, 
        field: 'email', 
        message: 'Email is required', 
        data: student 
      })
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(student.email.trim())) {
        errors.push({ 
          row, 
          field: 'email', 
          message: 'Invalid email format', 
          data: student 
        })
      }
    }

    // Student ID validation
    if (!student.student_id?.trim()) {
      errors.push({ 
        row, 
        field: 'student_id', 
        message: 'Student ID is required', 
        data: student 
      })
    } else if (student.student_id.trim().length < 5) {
      errors.push({ 
        row, 
        field: 'student_id', 
        message: 'Student ID must be at least 5 characters long', 
        data: student 
      })
    }

    // Department validation
    if (!student.department?.trim()) {
      errors.push({ 
        row, 
        field: 'department', 
        message: 'Department is required', 
        data: student 
      })
    }

    // Level validation
    if (!student.level?.trim()) {
      errors.push({ 
        row, 
        field: 'level', 
        message: 'Level is required', 
        data: student 
      })
    } else {
      const validLevels = ['100', '200', '300', '400']
      if (!validLevels.includes(student.level.trim())) {
        errors.push({ 
          row, 
          field: 'level', 
          message: 'Level must be one of: 100, 200, 300, 400', 
          data: student 
        })
      }
    }

    // Division validation
    if (!student.division?.trim()) {
      errors.push({ 
        row, 
        field: 'division', 
        message: 'Division is required', 
        data: student 
      })
    } else {
      const validDivisions = ['A', 'B', 'C', 'D']
      if (!validDivisions.includes(student.division.trim().toUpperCase())) {
        errors.push({ 
          row, 
          field: 'division', 
          message: 'Division must be one of: A, B, C, D', 
          data: student 
        })
      }
    }

    return errors
  }
}
