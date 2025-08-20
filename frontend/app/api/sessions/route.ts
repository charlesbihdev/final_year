import { NextRequest, NextResponse } from "next/server";
import { examSessionsDb } from "@/lib/db";

export async function GET() {
  try {
    const sessions = await examSessionsDb.getAllSessions();
    
    // Get divisions for each session
    const sessionsWithDivisions = await Promise.all(
      sessions.map(async (session) => {
        const sessionWithDivisions = await examSessionsDb.getSessionWithDivisions(session.id);
        return sessionWithDivisions || session;
      })
    );
    
    return NextResponse.json({
      success: true,
      data: sessionsWithDivisions,
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionData = await request.json();
    
    // Create the main session
    const sessionId = await examSessionsDb.createSession(sessionData);
    
    // Import sessionDivisionsDb
    const { sessionDivisionsDb } = await import("@/lib/db");
    
    // Automatically create divisions based on enrolled students
    await sessionDivisionsDb.createDivisionsForSession(sessionId, sessionData.course_id);
    
    return NextResponse.json({
      success: true,
      data: { id: sessionId, ...sessionData },
    });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create session" },
      { status: 500 }
    );
  }
}
