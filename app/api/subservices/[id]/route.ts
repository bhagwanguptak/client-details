import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { name, active } = await req.json();

  const subService = await prisma.subService.update({
    where: { id: params.id },
    data: { name, active },
  });

  return NextResponse.json(subService);
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { message: "SubService id missing" },
      { status: 400 }
    );
  }

  // ✅ Recommended: SOFT delete
  await prisma.subService.update({
    where: { id },
    data: { active: false },
  });

  return NextResponse.json({ success: true });
}