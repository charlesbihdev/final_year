import { NextRequest, NextResponse } from "next/server";
import { examSessionsDb } from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;

    const sessionWithDivisions = await examSessionsDb.getSessionWithDivisions(parseInt(sessionId));

    if (!sessionWithDivisions) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sessionWithDivisions,
    });
  } catch (error) {
    console.error("Error fetching session divisions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch session divisions" },
      { status: 500 }
    );
  }
}
