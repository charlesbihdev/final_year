import { NextRequest, NextResponse } from "next/server";
import { studentsDb } from "@/lib/db";

interface StudentImportData {
  name: string;
  email: string;
  index_number: string;
  department: string;
  level: string;
  division: string;
}

interface ImportError {
  row: number;
  field: string;
  message: string;
  data: any;
}

export async function POST(request: NextRequest) {
  try {
    const { students } = await request.json();

    if (!students || !Array.isArray(students)) {
      return NextResponse.json(
        { success: false, error: "Invalid request: students array required" },
        { status: 400 }
      );
    }

    const results = {
      success: true,
      totalRows: students.length,
      successCount: 0,
      errorCount: 0,
      errors: [] as ImportError[],
      successfulStudents: [] as StudentImportData[],
    };

    // Process each student
    for (let i = 0; i < students.length; i++) {
      const studentData = students[i];
      const rowNumber = i + 2; // CSV row number (accounting for header)

      try {
        // Convert level to number
        const level = parseInt(studentData.level);
        if (![100, 200, 300, 400].includes(level)) {
          throw new Error("Level must be 100, 200, 300, or 400");
        }

        // Prepare data for database
        const dbData = {
          name: studentData.name.trim(),
          email: studentData.email?.trim() || null,
          index_number: studentData.index_number.trim(),
          department: studentData.department?.trim() || null,
          level: level as 100 | 200 | 300 | 400,
          division: studentData.division.trim().toUpperCase() as 'A' | 'B' | 'C' | 'D',
        };

        // Create student in database
        await studentsDb.createStudent(dbData);
        
        results.successCount++;
        results.successfulStudents.push(studentData);

      } catch (error) {
        console.error(`Error importing student row ${rowNumber}:`, error);
        results.errorCount++;
        results.errors.push({
          row: rowNumber,
          field: 'general',
          message: error instanceof Error ? error.message : 'Unknown error',
          data: studentData,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
    });

  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Bulk import failed" 
      },
      { status: 500 }
    );
  }
}
