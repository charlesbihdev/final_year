import { NextRequest, NextResponse } from "next/server";
import { examSessionsDb } from "@/lib/db/index";

export async function GET(request: NextRequest) {
  try {
    // Get all sessions for debugging
    const result = await examSessionsDb.query(`
      SELECT es.*, c.title as course_title 
      FROM ExamSessions es 
      LEFT JOIN Courses c ON es.course_id = c.id
      ORDER BY es.id
    `);

    return NextResponse.json({
      success: true,
      data: {
        count: result.length,
        sessions: result,
      },
    });
  } catch (error) {
    console.error("Debug sessions failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Debug failed",
      },
      { status: 500 }
    );
  }
} 