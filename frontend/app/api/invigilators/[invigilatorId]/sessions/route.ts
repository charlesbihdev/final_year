import { NextRequest, NextResponse } from "next/server";
import { examSessionsDb, invigilatorsDb } from "@/lib/db/index";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ invigilatorId: string }> }
) {
  try {
    // The ID passed in is actually the user ID
    const params = await context.params;
    const userId = parseInt(params.invigilatorId);
    console.log("API: Fetching sessions for user ID:", userId);

    // First get the invigilator record for this user
    const invigilator = await invigilatorsDb.getInvigilatorByUserId(userId);
    console.log("API: Found invigilator:", invigilator);
    
    if (!invigilator) {
      console.log("API: Invigilator not found for user ID:", userId);
      return NextResponse.json(
        { success: false, error: "Invigilator not found" },
        { status: 404 }
      );
    }

    // Then get their assigned sessions using their invigilator ID
    const sessions = await examSessionsDb.getSessionsByInvigilator(
      invigilator.id
    );
    console.log("API: Found sessions:", sessions);

    return NextResponse.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error("API: Failed to fetch sessions:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch sessions",
      },
      { status: 500 }
    );
  }
}
