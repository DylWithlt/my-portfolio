// app/api/visits/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const count = 42;
  return NextResponse.json({ count });
}
