import { NextRequest, NextResponse } from "next/server";
import { attendanceDb } from "@/lib/db";

export async function GET() {
  try {
    const attendanceRecords = await attendanceDb.getAllAttendance();
    
    return NextResponse.json({
      success: true,
      data: attendanceRecords,
    });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch attendance records" },
      { status: 500 }
    );
  }
}
