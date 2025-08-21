import { NextRequest, NextResponse } from "next/server";
import { sessionDivisionsDb } from "@/lib/db/session-divisions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const resolvedParams = await params;
    const sessionId = parseInt(resolvedParams.sessionId);
    
    const divisions = await sessionDivisionsDb.getSessionDivisionsWithDetails(sessionId);
    
    return NextResponse.json({
      success: true,
      data: { divisions },
    });
  } catch (error) {
    console.error("Failed to fetch session divisions:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch session divisions",
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
    const body = await request.json();
    
    const { division, room_number, max_capacity } = body;
    
    if (!division) {
      return NextResponse.json(
        {
          success: false,
          error: "Division is required",
        },
        { status: 400 }
      );
    }
    
    const divisionId = await sessionDivisionsDb.createSessionDivision({
      session_id: sessionId,
      division,
      room_number,
      max_capacity,
    });
    
    return NextResponse.json({
      success: true,
      data: { id: divisionId },
    });
  } catch (error) {
    console.error("Failed to create session division:", error);
    
    // Handle unique constraint error
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        {
          success: false,
          error: "A division with this name already exists for this session. Please use a different division name.",
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create session division",
      },
      { status: 500 }
    );
  }
}
