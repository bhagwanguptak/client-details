import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");

  if (!clientId) return NextResponse.json([]);

  const docs = await prisma.document.findMany({
    where: { clientId },
    include: {
      subService: {
        include: {
          service: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(docs);
}
