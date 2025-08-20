import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { examSessionsDb, invigilatorsDb } from "@/lib/db/index";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({
        success: false,
        error: "Not authenticated"
      });
    }

    // Verify token
    const encodedKey = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token.value, encodedKey);
    const userId = payload.userId as number;

    // Get invigilator record
    const invigilator = await invigilatorsDb.getInvigilatorByUserId(userId);
    if (!invigilator) {
      return NextResponse.json({
        success: false,
        error: "Invigilator not found"
      });
    }

    // Get their assigned sessions
    const sessions = await examSessionsDb.getSessionsByInvigilator(invigilator.id);

    return NextResponse.json({
      success: true,
      data: {
        userId: userId,
        invigilatorId: invigilator.id,
        assignedSessions: sessions,
        sessionIds: sessions.map(s => s.id)
      }
    });
  } catch (error) {
    console.error("Debug user sessions failed:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Debug failed"
    });
  }
} 