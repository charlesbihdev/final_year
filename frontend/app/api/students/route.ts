import { NextRequest, NextResponse } from "next/server";
import { studentsDb } from "@/lib/db";

export async function GET() {
  try {
    const students = await studentsDb.getAllStudents();
    
    return NextResponse.json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const studentData = await request.json();
    
    const student = await studentsDb.createStudent(studentData);
    
    return NextResponse.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create student" },
      { status: 500 }
    );
  }
}
