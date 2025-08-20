import { NextRequest, NextResponse } from "next/server";
import { studentCoursesDb } from "@/lib/db";

interface EnrollmentData {
  student_id: number;
  course_id: number;
}

export async function POST(request: NextRequest) {
  try {
    const { enrollments } = await request.json();

    if (!enrollments || !Array.isArray(enrollments)) {
      return NextResponse.json(
        { success: false, error: "Invalid request: enrollments array required" },
        { status: 400 }
      );
    }

    const results = {
      success: true,
      totalEnrollments: enrollments.length,
      successCount: 0,
      errorCount: 0,
      errors: [] as string[],
    };

    // Process each enrollment
    for (let i = 0; i < enrollments.length; i++) {
      const enrollment: EnrollmentData = enrollments[i];

      try {
        await studentCoursesDb.enrollStudent(enrollment.student_id, enrollment.course_id);
        results.successCount++;
      } catch (error) {
        console.error(`Error enrolling student ${enrollment.student_id} in course ${enrollment.course_id}:`, error);
        results.errorCount++;
        results.errors.push(
          `Failed to enroll student ${enrollment.student_id} in course ${enrollment.course_id}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
    });

  } catch (error) {
    console.error("Bulk enrollment error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Bulk enrollment failed" 
      },
      { status: 500 }
    );
  }
}
