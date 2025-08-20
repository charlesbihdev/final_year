import { NextRequest, NextResponse } from "next/server";
import { invigilatorsDb } from "@/lib/db";

export async function GET() {
  try {
    const invigilators = await invigilatorsDb.getAllInvigilators();
    
    return NextResponse.json({
      success: true,
      data: invigilators,
    });
  } catch (error) {
    console.error("Error fetching invigilators:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch invigilators" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Hash the password before saving
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // First create the user account
    const userData = {
      name: data.name,
      email: data.email,
      password: hashedPassword, // Use hashed password
      role: "invigilator" as const
    };
    
    const { usersDb } = await import("@/lib/db");
    const userId = await usersDb.createUser(userData);
    
    // Then create the invigilator record
    const invigilatorData = {
      user_id: userId,
      department: data.department || null
    };
    
    const invigilatorId = await invigilatorsDb.createInvigilator(invigilatorData);
    
    return NextResponse.json({
      success: true,
      data: { id: invigilatorId, user_id: userId, ...invigilatorData },
    });
  } catch (error) {
    console.error("Error creating invigilator:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create invigilator" },
      { status: 500 }
    );
  }
}
