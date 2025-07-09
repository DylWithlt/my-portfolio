// app/api/visits/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const count = 4_678_432;
  return NextResponse.json({ count });
}
