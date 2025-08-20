import { NextRequest, NextResponse } from "next/server";
import { studentsDb } from "@/lib/db/index";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const resolvedParams = await params;
    const courseId = parseInt(resolvedParams.courseId);
    const students = await studentsDb.getStudentsByCourse(courseId);

    return NextResponse.json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error("Failed to fetch course students:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch students",
      },
      { status: 500 }
    );
  }
} 