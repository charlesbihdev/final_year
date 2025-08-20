import { NextRequest, NextResponse } from "next/server";
import { invigilatorsDb, usersDb } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ invigilatorId: string }> }
) {
  try {
    const { invigilatorId } = await context.params;
    const data = await request.json();

    // If updating user data, update Users table first
    if (data.name || data.email || data.password) {
      const invigilator = await invigilatorsDb.getInvigilator(parseInt(invigilatorId));
      if (invigilator) {
        const userData: any = {};
        if (data.name) userData.name = data.name;
        if (data.email) userData.email = data.email;
        if (data.password) {
          // Hash the password before saving
          const bcrypt = await import("bcryptjs");
          userData.password = await bcrypt.hash(data.password, 10);
        }
        
        if (Object.keys(userData).length > 0) {
          await usersDb.updateUser(invigilator.user_id, userData);
        }
      }
    }

    // Update invigilator-specific data
    const invigilatorData: any = {};
    if (data.department !== undefined) invigilatorData.department = data.department;

    if (Object.keys(invigilatorData).length > 0) {
      await invigilatorsDb.updateInvigilator(parseInt(invigilatorId), invigilatorData);
    }

    return NextResponse.json({
      success: true,
      message: "Invigilator updated successfully",
    });
  } catch (error) {
    console.error("Error updating invigilator:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update invigilator" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ invigilatorId: string }> }
) {
  try {
    const { invigilatorId } = await context.params;

    // Get invigilator to find associated user
    const invigilator = await invigilatorsDb.getInvigilator(parseInt(invigilatorId));
    
    if (invigilator) {
      // Delete invigilator first (foreign key constraint)
      await invigilatorsDb.deleteInvigilator(parseInt(invigilatorId));
      
      // Then delete associated user
      await usersDb.deleteUser(invigilator.user_id);
    }

    return NextResponse.json({
      success: true,
      message: "Invigilator deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting invigilator:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete invigilator" },
      { status: 500 }
    );
  }
}