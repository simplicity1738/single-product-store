import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth.server";
import {
  deleteLabTest,
  getLabTestById,
  updateLabTest,
} from "@/lib/lab-test.server";
import type { LabTest } from "@/lib/lab-test";
import { sanitizeIdentifier } from "@/lib/sanitize";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const testId = sanitizeIdentifier(id, 80);
  if (!testId) {
    return NextResponse.json(
      { success: false, message: "Ogiltigt labbtest-ID." },
      { status: 400 },
    );
  }

  const test = await getLabTestById(testId);
  if (!test) {
    return NextResponse.json(
      { success: false, message: "Labbtestet hittades inte." },
      { status: 404 },
    );
  }

  return NextResponse.json({ test });
}

export async function PUT(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const testId = sanitizeIdentifier(id, 80);
  if (!testId) {
    return NextResponse.json(
      { success: false, message: "Ogiltigt labbtest-ID." },
      { status: 400 },
    );
  }

  try {
    const body = (await request.json()) as Partial<LabTest>;
    const test = await updateLabTest(testId, body);

    if (!test) {
      return NextResponse.json(
        { success: false, message: "Labbtestet hittades inte." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Labbtest uppdaterat.",
      test,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Kunde inte uppdatera labbtestet." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const testId = sanitizeIdentifier(id, 80);
  if (!testId) {
    return NextResponse.json(
      { success: false, message: "Ogiltigt labbtest-ID." },
      { status: 400 },
    );
  }

  const deleted = await deleteLabTest(testId);
  if (!deleted) {
    return NextResponse.json(
      { success: false, message: "Labbtestet hittades inte." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    message: "Labbtest borttaget.",
  });
}
