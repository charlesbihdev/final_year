import { NextRequest, NextResponse } from "next/server";
import { attendanceDb } from "@/lib/db/index";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const resolvedParams = await params;
    const sessionId = parseInt(resolvedParams.sessionId);
    const { present, total } = await attendanceDb.getSessionAttendance(
      sessionId
    );

    const counts = {
      present: present.length,
      total,
      attendance: present,
    };

    return NextResponse.json({
      success: true,
      data: counts,
    });
  } catch (error) {
    console.error("Failed to fetch attendance:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch attendance",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const resolvedParams = await params;
    const sessionId = parseInt(resolvedParams.sessionId);
    const { student_id, method = 'manual' } = await request.json();

    if (!student_id) {
      return NextResponse.json(
        { success: false, error: "Student ID is required" },
        { status: 400 }
      );
    }

    // We need to get the session_division_id for this student
    const { studentsDb, examSessionsDb } = await import("@/lib/db");
    const student = await studentsDb.getStudent(student_id);
    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      );
    }

    // Use getSessionWithDivisions to ensure all required divisions exist
    const sessionWithDivisions = await examSessionsDb.getSessionWithDivisions(sessionId);
    if (!sessionWithDivisions) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    // Check if student is enrolled in this course
    const { studentCoursesDb } = await import("@/lib/db");
    const isEnrolled = await studentCoursesDb.isStudentEnrolled(student_id, sessionWithDivisions.course_id);
    if (!isEnrolled) {
      return NextResponse.json(
        { success: false, error: "Student is not enrolled in this course" },
        { status: 400 }
      );
    }

    const matchingDivision = sessionWithDivisions.divisions?.find(div => div.division === student.division);
    
    if (!matchingDivision) {
      return NextResponse.json(
        { success: false, error: `No division ${student.division} found for this session. Please ensure the student is enrolled in this course.` },
        { status: 400 }
      );
    }

    const recordId = await attendanceDb.createAttendance({
      student_id,
      session_id: sessionId,
      session_division_id: matchingDivision.id,
      method,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: { id: recordId },
      message: "Attendance marked successfully",
    });
  } catch (error) {
    console.error("Failed to mark attendance:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to mark attendance",
      },
      { status: 500 }
    );
  }
}
