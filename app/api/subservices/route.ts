import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* GET: all subservices for a service */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const serviceId = searchParams.get("serviceId");

  if (!serviceId) {
    return NextResponse.json(
      { message: "serviceId is required" },
      { status: 400 }
    );
  }

  const subservices = await prisma.subService.findMany({
    where: {
      serviceId,
      active: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(subservices);
}

/* POST: add subservice */
export async function POST(req: Request) {
  const { name, serviceId } = await req.json();

  if (!name || name.trim().length < 3 || !serviceId) {
    return NextResponse.json(
      { message: "Invalid subservice data" },
      { status: 400 }
    );
  }

  const subservice = await prisma.subService.create({
    data: {
      name: name.trim(),
      serviceId,
      active: true,
    },
  });

  return NextResponse.json(subservice);
}
