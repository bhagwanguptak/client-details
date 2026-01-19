import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* GET: fetch all active subservices with parent service */
export async function GET() {
  const subServices = await prisma.subService.findMany({
    where: { active: true },
    include: {
      service: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(subServices);
}
