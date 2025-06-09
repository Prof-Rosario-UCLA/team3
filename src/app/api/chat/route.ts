import { NextResponse } from "next/server";

export async function GET() {
  // do stuff here...
  return NextResponse.json({ message: "Hello!" });
}
