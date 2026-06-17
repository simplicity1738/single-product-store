import { NextResponse } from "next/server";
import { readLabTests } from "@/lib/lab-test.server";

export async function GET() {
  const tests = await readLabTests();
  return NextResponse.json({ tests });
}
