import { NextRequest, NextResponse } from "next/server";
import { sessionDivisionsDb } from "@/lib/db/session-divisions";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ divisionId: string }> }
) {
  try {
    const resolvedParams = await params;
    const divisionId = parseInt(resolvedParams.divisionId);
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
    
    await sessionDivisionsDb.updateSessionDivision(divisionId, {
      division,
      room_number,
      max_capacity,
    });
    
    return NextResponse.json({
      success: true,
      data: { id: divisionId },
    });
  } catch (error) {
    console.error("Failed to update session division:", error);
    
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
        error: error instanceof Error ? error.message : "Failed to update session division",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ divisionId: string }> }
) {
  try {
    const resolvedParams = await params;
    const divisionId = parseInt(resolvedParams.divisionId);
    
    await sessionDivisionsDb.deleteSessionDivision(divisionId);
    
    return NextResponse.json({
      success: true,
      data: { id: divisionId },
    });
  } catch (error) {
    console.error("Failed to delete session division:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete session division",
      },
      { status: 500 }
    );
  }
}
