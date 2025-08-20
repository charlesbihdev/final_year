import { NextRequest, NextResponse } from "next/server";
import { sessionDivisionsDb } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ divisionId: string }> }
) {
  try {
    const { divisionId } = await context.params;
    const { invigilator_ids } = await request.json();

    if (!Array.isArray(invigilator_ids)) {
      return NextResponse.json(
        { success: false, error: "invigilator_ids must be an array" },
        { status: 400 }
      );
    }

    await sessionDivisionsDb.assignInvigilatorsToSessionDivision(parseInt(divisionId), invigilator_ids);

    return NextResponse.json({
      success: true,
      message: "Invigilators assigned successfully",
    });
  } catch (error) {
    console.error("Error assigning invigilators to division:", error);
    return NextResponse.json(
      { success: false, error: "Failed to assign invigilators" },
      { status: 500 }
    );
  }
}
