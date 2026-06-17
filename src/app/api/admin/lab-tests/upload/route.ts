import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth.server";

const MAX_FILE_SIZE = 12 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "Ingen fil mottagen." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, message: "Endast PDF, JPG, PNG eller WEBP tillåts." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "Filen får vara max 12 MB." },
        { status: 400 },
      );
    }

    const extension = file.type === "application/pdf" ? "pdf" : file.name.split(".").pop() || "bin";
    const baseName = sanitizeFilename(file.name.replace(/\.[^.]+$/, "")) || "lab-report";
    const filename = `${baseName}-${Date.now()}.${extension}`;
    const directory = path.join(process.cwd(), "public", "lab-reports");
    await mkdir(directory, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(directory, filename), buffer);

    return NextResponse.json({
      success: true,
      message: "Analysrapport uppladdad.",
      reportUrl: `/lab-reports/${filename}`,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Kunde inte ladda upp filen." },
      { status: 500 },
    );
  }
}
