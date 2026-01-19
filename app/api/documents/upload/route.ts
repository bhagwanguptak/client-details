import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const formData = await req.formData();

  const file = formData.get("file") as File | null;
  const clientId = formData.get("clientId") as string;
  const subServiceId = formData.get("subServiceId") as string;

  if (!file || !clientId || !subServiceId) {
    return NextResponse.json(
      { message: "Missing data" },
      { status: 400 }
    );
  }

  // ✅ Create upload folder
  const uploadDir = path.join(
    process.cwd(),
    "public/uploads",
    clientId
  );

  await fs.mkdir(uploadDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(uploadDir, fileName);

  await fs.writeFile(filePath, buffer);

  const fileUrl = `/uploads/${clientId}/${fileName}`;

  // ✅ Save DB record
  const doc = await prisma.document.create({
    data: {
      clientId,
      subServiceId,
      fileName: file.name,
      fileUrl,
    },
  });

  return NextResponse.json(doc);
}
