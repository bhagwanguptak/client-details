import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { name, description, active } = await req.json();

  const service = await prisma.service.update({
    where: { id: params.id },
    data: { name, description, active },
  });

  return NextResponse.json(service);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Delete all sub-services belonging to this service first
    await prisma.subService.deleteMany({
      where: { serviceId: id },
    });

    // 2. Delete the service itself
    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json(
      { message: "Failed to delete service. It might be linked to active clients." },
      { status: 500 }
    );
  }
}