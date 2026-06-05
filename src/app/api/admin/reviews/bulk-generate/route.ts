import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ created: 0, message: "Bulk generate is disabled in static mode." });
}
