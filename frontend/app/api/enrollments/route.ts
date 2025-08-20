import { NextRequest, NextResponse } from "next/server";
import { studentCoursesDb } from "@/lib/db";

export async function GET() {
  try {
    const enrollments = await studentCoursesDb.getAllEnrollments();
    
    return NextResponse.json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { student_id, course_id } = await request.json();
    
    const enrollment = await studentCoursesDb.enrollStudent(student_id, course_id);
    
    return NextResponse.json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    console.error("Error creating enrollment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create enrollment" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { student_id, course_id } = await request.json();
    
    await studentCoursesDb.unenrollStudent(student_id, course_id);
    
    return NextResponse.json({
      success: true,
      message: "Enrollment removed successfully",
    });
  } catch (error) {
    console.error("Error removing enrollment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove enrollment" },
      { status: 500 }
    );
  }
}
