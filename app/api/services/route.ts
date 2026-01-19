import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(services);
}

export async function POST(req: Request) {
  const { name } = await req.json();

  if (!name || name.trim().length < 3) {
    return NextResponse.json(
      { message: "Service name must be at least 3 characters" },
      { status: 400 }
    );
  }
  

  const service = await prisma.service.create({
    data: {
      name: name.trim(),
      active: true, // 🔥 important
    },
  });

  return NextResponse.json(service);
}
