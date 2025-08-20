import { NextRequest, NextResponse } from "next/server";
import { examSessionsDb } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;
    const { is_active } = await request.json();

    await examSessionsDb.updateSession(parseInt(sessionId), { is_active });

    return NextResponse.json({
      success: true,
      message: `Session ${is_active ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    console.error("Error toggling session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle session status" },
      { status: 500 }
    );
  }
}