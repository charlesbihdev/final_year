import { NextRequest, NextResponse } from "next/server";
import { studentsDb } from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await context.params;
    const student = await studentsDb.getStudent(parseInt(studentId));
    
    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch student" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await context.params;
    const updateData = await request.json();
    
    const student = await studentsDb.updateStudent(parseInt(studentId), updateData);
    
    return NextResponse.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update student" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await context.params;
    await studentsDb.deleteStudent(parseInt(studentId));
    
    return NextResponse.json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete student" },
      { status: 500 }
    );
  }
}
