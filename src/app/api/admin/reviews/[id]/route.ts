import { NextResponse } from "next/server";

export async function PUT() {
  return NextResponse.json({ message: "Review editing is disabled in static mode." });
}
export async function DELETE() {
  return NextResponse.json({ success: true, message: "Review deletion is disabled in static mode." });
}
