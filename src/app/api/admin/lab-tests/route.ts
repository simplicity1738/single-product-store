import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth.server";
import { createLabTest, readLabTests } from "@/lib/lab-test.server";
import type { LabTest } from "@/lib/lab-test";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const tests = await readLabTests();
  return NextResponse.json({ tests });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as Partial<LabTest>;
    const test = await createLabTest(body);

    return NextResponse.json({
      success: true,
      message: "Labbtest sparat.",
      test,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Kunde inte spara labbtestet." },
      { status: 500 },
    );
  }
}
