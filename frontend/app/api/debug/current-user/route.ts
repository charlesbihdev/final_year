import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { usersDb, invigilatorsDb } from "@/lib/db";

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

    // Get user data
    const user = await usersDb.getUser(payload.userId as number);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found"
      });
    }

    // Get invigilator data if user is an invigilator
    let invigilator = null;
    if (user.role === 'invigilator') {
      invigilator = await invigilatorsDb.getInvigilatorByUserId(user.id);
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        invigilator: invigilator
      }
    });
  } catch (error) {
    console.error("Debug current user failed:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Debug failed"
    });
  }
} 