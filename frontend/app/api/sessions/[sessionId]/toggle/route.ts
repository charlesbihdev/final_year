import { NextRequest, NextResponse } from "next/server";
import { examSessionsDb } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const params = await context.params;
    const sessionId = parseInt(params.sessionId);
    
    // Get current session status
    const session = await examSessionsDb.getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    // Toggle the status
    const newStatus = !session.is_active;
    await examSessionsDb.updateSession(sessionId, { is_active: newStatus });

    return NextResponse.json({
      success: true,
      data: { is_active: newStatus },
    });
  } catch (error) {
    console.error("Error toggling session status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle session status" },
      { status: 500 }
    );
  }
}