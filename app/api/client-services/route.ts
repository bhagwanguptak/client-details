import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* GET: list assigned services for a client */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");

  if (!clientId) {
    return NextResponse.json([], { status: 200 });
  }

  const mappings = await prisma.clientService.findMany({
    where: { clientId },
    include: {
      service: {
        select: { id: true, name: true },
      },
      subService: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(mappings);
}

/* POST: assign service/subservice to client */
export async function POST(req: Request) {
  const { clientId, serviceId, subServiceId } = await req.json();

  if (!clientId || !serviceId) {
    return NextResponse.json(
      { message: "clientId and serviceId are required" },
      { status: 400 }
    );
  }

  const mapping = await prisma.clientService.create({
    data: {
      clientId,
      serviceId,
      subServiceId: subServiceId || null,
    },
  });

  return NextResponse.json(mapping);
}
