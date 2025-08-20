import { NextRequest, NextResponse } from "next/server";
import { coursesDb } from "@/lib/db";

export async function GET() {
  try {
    const courses = await coursesDb.getAllCourses();
    
    return NextResponse.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const courseData = await request.json();
    
    const course = await coursesDb.createCourse(courseData);
    
    return NextResponse.json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create course" },
      { status: 500 }
    );
  }
}
