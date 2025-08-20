import { NextRequest, NextResponse } from "next/server";
import { studentCoursesDb } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ enrollmentId: string }> }
) {
  try {
    const { enrollmentId } = await context.params;
    
    await studentCoursesDb.deleteEnrollment(parseInt(enrollmentId));
    
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
