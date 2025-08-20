import { NextRequest, NextResponse } from "next/server";
import { examSessionsDb } from "@/lib/db/index";

export async function GET(request: NextRequest) {
  try {
    // Get session assignments
    const result = await examSessionsDb.query(`
      SELECT 
        es.id as session_id,
        es.date,
        es.start_time,
        c.title as course_title,
        i.id as invigilator_id,
        u.name as invigilator_name,
        u.email as invigilator_email
      FROM ExamSessions es 
      LEFT JOIN Courses c ON es.course_id = c.id
      LEFT JOIN SessionInvigilators si ON es.id = si.session_id
      LEFT JOIN Invigilators i ON si.invigilator_id = i.id
      LEFT JOIN Users u ON i.user_id = u.id
      ORDER BY es.id
    `);

    return NextResponse.json({
      success: true,
      data: {
        assignments: result,
      },
    });
  } catch (error) {
    console.error("Debug invigilator sessions failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Debug failed",
      },
      { status: 500 }
    );
  }
} 