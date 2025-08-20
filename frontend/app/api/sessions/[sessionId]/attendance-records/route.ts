import { NextRequest, NextResponse } from "next/server";
import { attendanceDb } from "@/lib/db/index";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const resolvedParams = await params;
    const sessionId = parseInt(resolvedParams.sessionId);
    const records = await attendanceDb.getAttendanceBySession(sessionId);

    return NextResponse.json({
      success: true,
      data: records,
    });
  } catch (error) {
    console.error("Failed to fetch attendance records:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch attendance records",
      },
      { status: 500 }
    );
  }
} 