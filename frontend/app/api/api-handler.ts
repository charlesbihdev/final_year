import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function handleGET(handler: () => Promise<any>) {
  try {
    const data = await handler();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function handlePOST(
  handler: (body: any) => Promise<any>,
  request: Request
) {
  try {
    const body = await request.json();
    const data = await handler(body);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function handlePUT(
  handler: (id: number, body: any) => Promise<any>,
  request: Request,
  id: number
) {
  try {
    const body = await request.json();
    const data = await handler(id, body);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function handleDELETE(
  handler: (id: number) => Promise<any>,
  id: number
) {
  try {
    await handler(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
